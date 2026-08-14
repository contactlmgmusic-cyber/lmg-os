import "server-only";

import { simpleParser } from "mailparser";
import { createClient } from "@supabase/supabase-js";
import { createOvhImapClient } from "@/lib/ovh-imap.server";

type OriginalEmail = {
  id: string;
  entity_type:
    | "media"
    | "influenceur"
    | "partenaire"
    | "prospect";
  entity_id: string;
  rfc_message_id: string | null;
  recipient_email: string;
  subject: string;
  sent_at: string;
};

function createSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configuration Supabase indisponible."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function normalizeMessageId(
  value?: string | null
) {
  const cleanValue =
    String(value || "").trim();

  if (!cleanValue) {
    return null;
  }

  const match =
    cleanValue.match(
      /<[^<>]+>/
    );

  return (
    match?.[0] ||
    cleanValue
  ).toLowerCase();
}

function getReferencedMessageIds({
  inReplyTo,
  references,
}: {
  inReplyTo?:
    | string
    | string[]
    | null;
  references?:
    | string
    | string[]
    | null;
}) {
  const values = [
    ...(Array.isArray(inReplyTo)
      ? inReplyTo
      : inReplyTo
        ? [inReplyTo]
        : []),

    ...(Array.isArray(references)
      ? references
      : references
        ? [references]
        : []),
  ];

  const messageIds =
    values.flatMap((value) => {
      const matches =
        String(value).match(
          /<[^<>]+>/g
        );

      if (matches?.length) {
        return matches;
      }

      return [String(value)];
    });

  return Array.from(
    new Set(
      messageIds
        .map(normalizeMessageId)
        .filter(
          (
            value
          ): value is string =>
            Boolean(value)
        )
    )
  );
}

function normalizeEmail(
  value?: string | null
) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeSubject(
  value?: string | null
) {
  return String(value || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /^(?:(?:re|ré|fw|fwd|tr)\s*:\s*)+/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getFirstAddress(
  addressObject:
    | {
        value?: Array<{
          name?: string;
          address?: string;
        }>;
      }
    | undefined
    | null
) {
  return (
    addressObject?.value?.[0] ||
    null
  );
}

function getSafeDate(
  value:
    | Date
    | string
    | number
    | undefined
    | null
) {
  const date =
    value instanceof Date
      ? value
      : new Date(
          value || Date.now()
        );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return new Date();
  }

  return date;
}

async function findOriginalEmail({
  supabaseAdmin,
  referencedIds,
  senderEmail,
  replySubject,
  replyReceivedAt,
}: {
  supabaseAdmin: ReturnType<
    typeof createSupabaseAdmin
  >;
  referencedIds: string[];
  senderEmail: string;
  replySubject: string;
  replyReceivedAt: Date;
}): Promise<OriginalEmail | null> {
  /*
   * Première recherche :
   * correspondance directe avec
   * In-Reply-To ou References.
   */
  if (referencedIds.length > 0) {
    const {
      data: directCandidates,
      error: directError,
    } = await supabaseAdmin
      .from("crm_email_logs")
      .select(
        `
          id,
          entity_type,
          entity_id,
          rfc_message_id,
          recipient_email,
          subject,
          sent_at
        `
      )
      .eq("status", "sent")
      .not(
        "rfc_message_id",
        "is",
        null
      )
      .order("sent_at", {
        ascending: false,
      })
      .limit(250);

    if (directError) {
      console.error(
        "Erreur recherche Message-ID :",
        directError
      );
    } else {
      const directMatch =
        (
          directCandidates || []
        ).find((candidate) => {
          const candidateMessageId =
            normalizeMessageId(
              candidate.rfc_message_id
            );

          return (
            candidateMessageId &&
            referencedIds.includes(
              candidateMessageId
            )
          );
        });

      if (directMatch) {
        return (
          directMatch as OriginalEmail
        );
      }
    }
  }

  /*
   * Recherche de secours :
   * même expéditeur, même objet
   * normalisé et envoi antérieur
   * à la réponse.
   */
  if (
    !senderEmail ||
    !replySubject
  ) {
    return null;
  }

  const {
    data: fallbackCandidates,
    error: fallbackError,
  } = await supabaseAdmin
    .from("crm_email_logs")
    .select(
      `
        id,
        entity_type,
        entity_id,
        rfc_message_id,
        recipient_email,
        subject,
        sent_at
      `
    )
    .eq("status", "sent")
    .lt(
      "sent_at",
      replyReceivedAt.toISOString()
    )
    .order("sent_at", {
      ascending: false,
    })
    .limit(250);

  if (fallbackError) {
    console.error(
      "Erreur rapprochement de secours :",
      fallbackError
    );

    return null;
  }

  const normalizedSender =
    normalizeEmail(senderEmail);

  const matchingCandidate =
    (
      fallbackCandidates || []
    ).find((candidate) => {
      const sameRecipient =
        normalizeEmail(
          candidate.recipient_email
        ) === normalizedSender;

      const sameSubject =
        normalizeSubject(
          candidate.subject
        ) === replySubject;

      return (
        sameRecipient &&
        sameSubject
      );
    });

  return matchingCandidate
    ? (matchingCandidate as OriginalEmail)
    : null;
}

export async function syncOvhEmailReplies() {
  const supabaseAdmin =
    createSupabaseAdmin();

  const imapClient =
    createOvhImapClient();

  let scanned = 0;
  let matched = 0;
  let created = 0;
  let ignored = 0;

  try {
    await imapClient.connect();

    const mailboxLock =
      await imapClient.getMailboxLock(
        "INBOX"
      );

    try {
      const since = new Date();

      since.setDate(
        since.getDate() - 30
      );

      const messageUids =
        await imapClient.search(
          {
            since,
          },
          {
            uid: true,
          }
        );

      const recentUids =
        Array.isArray(messageUids)
          ? messageUids.slice(-250)
          : [];

      if (
        recentUids.length === 0
      ) {
        return {
          scanned,
          matched,
          created,
          ignored,
        };
      }

      for await (
        const fetchedMessage of imapClient.fetch(
          recentUids,
          {
            uid: true,
            source: true,
            internalDate: true,
          },
          {
            uid: true,
          }
        )
      ) {
        scanned += 1;

        if (!fetchedMessage.source) {
          ignored += 1;
          continue;
        }

        let parsed;

        try {
          parsed = await simpleParser(
            fetchedMessage.source
          );
        } catch (parseError) {
          console.error(
            "Erreur lecture e-mail OVH :",
            parseError
          );

          ignored += 1;
          continue;
        }

        const messageId =
          normalizeMessageId(
            parsed.messageId
          );

        if (!messageId) {
          ignored += 1;
          continue;
        }

        /*
         * Évite d’importer deux fois
         * la même réponse.
         */
        const {
          data: existingReply,
          error:
            existingReplyError,
        } = await supabaseAdmin
          .from(
            "crm_email_replies"
          )
          .select("id")
          .eq(
            "message_id",
            messageId
          )
          .maybeSingle();

        if (
          existingReplyError
        ) {
          console.error(
            "Erreur vérification réponse existante :",
            existingReplyError
          );

          ignored += 1;
          continue;
        }

        if (existingReply) {
          ignored += 1;
          continue;
        }

        const sender =
          getFirstAddress(
            parsed.from
          );

        const recipient =
  getFirstAddress(
    Array.isArray(parsed.to)
      ? parsed.to[0]
      : parsed.to
  );

        const senderEmail =
          normalizeEmail(
            sender?.address
          );

        if (!senderEmail) {
          ignored += 1;
          continue;
        }

        /*
         * Ne pas enregistrer les
         * messages envoyés par LMG
         * comme des réponses reçues.
         */
        if (
          senderEmail ===
          "contact@legacymusicgroup.fr"
        ) {
          ignored += 1;
          continue;
        }

        const receivedAt =
          getSafeDate(
            parsed.date ||
              fetchedMessage.internalDate
          );

        const referencedIds =
          getReferencedMessageIds({
            inReplyTo:
              parsed.inReplyTo,

            references:
              parsed.references,
          });

        const replySubject =
          normalizeSubject(
            parsed.subject
          );

        const originalEmail =
          await findOriginalEmail({
            supabaseAdmin,
            referencedIds,
            senderEmail,
            replySubject,
            replyReceivedAt:
              receivedAt,
          });

        if (!originalEmail) {
          ignored += 1;
          continue;
        }

        matched += 1;

        const {
          error: insertError,
        } = await supabaseAdmin
          .from(
            "crm_email_replies"
          )
          .insert({
            email_log_id:
              originalEmail.id,

            entity_type:
              originalEmail.entity_type,

            entity_id:
              originalEmail.entity_id,

            message_id:
              messageId,

            in_reply_to:
              referencedIds[0] ||
              null,

            references_header:
              referencedIds.length >
              0
                ? referencedIds.join(
                    " "
                  )
                : null,

            sender_email:
              senderEmail,

            sender_name:
              sender?.name?.trim() ||
              null,

            recipient_email:
              normalizeEmail(
                recipient?.address
              ) || null,

            subject:
              parsed.subject?.trim() ||
              null,

            message_text:
              parsed.text?.trim() ||
              null,

            message_html:
              typeof parsed.html ===
              "string"
                ? parsed.html
                : null,

            received_at:
              receivedAt.toISOString(),
          });

        if (insertError) {
          /*
           * Le message a déjà pu être
           * importé par un autre cron.
           */
          if (
            insertError.code ===
            "23505"
          ) {
            ignored += 1;
            continue;
          }

          console.error(
            "Erreur enregistrement réponse CRM :",
            insertError
          );

          ignored += 1;
          continue;
        }

        created += 1;
      }
    } finally {
      mailboxLock.release();
    }

    return {
      scanned,
      matched,
      created,
      ignored,
    };
  } finally {
    try {
      await imapClient.logout();
    } catch (logoutError) {
      console.error(
        "Erreur fermeture IMAP OVH :",
        logoutError
      );
    }
  }
}