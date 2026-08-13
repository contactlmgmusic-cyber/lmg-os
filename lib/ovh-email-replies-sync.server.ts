import "server-only";

import { simpleParser } from "mailparser";
import { createClient } from "@supabase/supabase-js";
import { createOvhImapClient } from "@/lib/ovh-imap.server";

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
  if (!value) return null;

  const cleaned = value.trim();

  if (!cleaned) return null;

  return cleaned.startsWith("<")
    ? cleaned
    : `<${cleaned.replace(
        /^<|>$/g,
        ""
      )}>`;
}

function getReferencedMessageIds({
  inReplyTo,
  references,
}: {
  inReplyTo?: string | null;
  references?: string[] | string | null;
}) {
  const values = [
    ...(inReplyTo
      ? [inReplyTo]
      : []),

    ...(Array.isArray(references)
      ? references
      : references
        ? [references]
        : []),
  ];

  return Array.from(
    new Set(
      values
        .flatMap((value) => {
          const matches =
            value.match(
              /<[^<>]+>/g
            );

          return matches?.length
            ? matches
            : [value];
        })
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

function getFirstAddress(
  address:
    | {
        value?: Array<{
          address?: string;
          name?: string;
        }>;
      }
    | Array<{
        value?: Array<{
          address?: string;
          name?: string;
        }>;
      }>
    | null
    | undefined
) {
  const addressObject =
    Array.isArray(address)
      ? address[0]
      : address;

  return (
    addressObject?.value?.[0] ||
    null
  );
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
      /*
       * On analyse les messages reçus durant
       * les 30 derniers jours.
       *
       * La contrainte unique sur message_id
       * empêche tout doublon.
       */
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

      /*
       * On limite chaque exécution aux
       * 250 messages les plus récents.
       */
      const recentUids =
  Array.isArray(messageUids)
    ? messageUids.slice(-250)
    : [];

      if (recentUids.length === 0) {
        return {
          scanned,
          matched,
          created,
          ignored,
        };
      }

      for await (
        const fetchedMessage of
        imapClient.fetch(
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

        const parsed =
          await simpleParser(
            fetchedMessage.source
          );

        const messageId =
          normalizeMessageId(
            parsed.messageId
          );

        if (!messageId) {
          ignored += 1;
          continue;
        }

        const {
          data: existingReply,
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
    parsed.to
  );

const senderEmail =
  sender?.address?.trim() || "";

if (!senderEmail) {
  ignored += 1;
  continue;
}

const referencedIds =
  getReferencedMessageIds({
    inReplyTo:
      parsed.inReplyTo,

    references:
      parsed.references,
  });

type OriginalEmail = {
  id: string;
  entity_type: string;
  entity_id: string;
  rfc_message_id: string | null;
};

let originalEmail:
  | OriginalEmail
  | null = null;

/*
 * Recherche principale :
 * correspondance avec In-Reply-To
 * ou References.
 */
if (referencedIds.length > 0) {
  const {
    data,
    error:
      originalEmailError,
  } = await supabaseAdmin
    .from("crm_email_logs")
    .select(
      `
        id,
        entity_type,
        entity_id,
        rfc_message_id
      `
    )
    .in(
      "rfc_message_id",
      referencedIds
    )
    .eq("status", "sent")
    .order("sent_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (originalEmailError) {
    console.error(
      "Erreur recherche Message-ID :",
      originalEmailError
    );
  }

  originalEmail =
    data as OriginalEmail | null;
}

/*
 * Recherche de secours :
 * même destinataire et même objet.
 *
 * Utile lorsque Gmail remplace le
 * Message-ID personnalisé pendant
 * l’envoi.
 */
if (!originalEmail) {
  const normalizedSubject =
    String(
      parsed.subject || ""
    )
      .replace(
        /^(?:(?:re|ré|fw|fwd)\s*:\s*)+/gi,
        ""
      )
      .trim();

  if (normalizedSubject) {
    const receivedAtValue =
      parsed.date ||
      fetchedMessage.internalDate ||
      new Date();

    const replyReceivedAt =
      receivedAtValue instanceof Date
        ? receivedAtValue
        : new Date(
            receivedAtValue
          );

    const {
      data: fallbackEmail,
      error: fallbackError,
    } = await supabaseAdmin
      .from("crm_email_logs")
      .select(
        `
          id,
          entity_type,
          entity_id,
          rfc_message_id
        `
      )
      .eq(
        "recipient_email",
        senderEmail
      )
      .eq(
        "subject",
        normalizedSubject
      )
      .eq("status", "sent")
      .lt(
        "sent_at",
        replyReceivedAt.toISOString()
      )
      .order("sent_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (fallbackError) {
      console.error(
        "Erreur rapprochement de secours :",
        fallbackError
      );
    }

    originalEmail =
      fallbackEmail as OriginalEmail | null;
  }
}

if (!originalEmail) {
  ignored += 1;
  continue;
}

matched += 1;

        /*
         * Sécurité supplémentaire :
         * on n’enregistre pas nos propres
         * messages comme des réponses.
         */
        if (
          senderEmail.toLowerCase() ===
          "contact@legacymusicgroup.fr"
        ) {
          ignored += 1;
          continue;
        }

        const receivedAtValue =
  parsed.date ||
  fetchedMessage.internalDate ||
  new Date();

const receivedAt =
  receivedAtValue instanceof Date
    ? receivedAtValue
    : new Date(receivedAtValue);

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
              normalizeMessageId(
                parsed.inReplyTo
              ),

            references_header:
              referencedIds.join(" "),

            sender_email:
              senderEmail,

            sender_name:
              sender?.name?.trim() ||
              null,

            recipient_email:
              recipient?.address?.trim() ||
              null,

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
           * Le code 23505 correspond à un
           * message déjà enregistré.
           */
          if (
            insertError.code ===
            "23505"
          ) {
            ignored += 1;
            continue;
          }

          throw insertError;
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
    if (
      imapClient.usable
    ) {
      await imapClient.logout();
    }
  }
}