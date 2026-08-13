"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import GmailComposer from "@/components/GmailComposer";

type EntityType =
  | "media"
  | "influenceur"
  | "partenaire"
  | "prospect";

type EmailReply = {
  id: string;
  email_log_id: string;
  sender_email: string;
  sender_name: string | null;
  recipient_email: string | null;
  subject: string | null;
  message_text: string | null;
  received_at: string;
};

type EmailLog = {
  id: string;
  recipient_email: string;
  subject: string;
  message: string;
  status: "sent" | "failed";
  error_message: string | null;
  sent_by: string;
  sent_at: string;
  rfc_message_id?: string | null;
  replies?: EmailReply[];
};

type ScheduledEmailStatus =
  | "pending"
  | "processing"
  | "sent"
  | "failed"
  | "cancelled";

type ScheduledEmail = {
  id: string;
  recipient_email: string;
  subject: string;
  message: string;
  scheduled_for: string;
  status: ScheduledEmailStatus;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
  attempts: number;
};

function formatDate(date?: string | null) {
  if (!date) {
    return "Date indisponible";
  }

  return new Date(date).toLocaleString(
    "fr-FR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function getScheduledStatusLabel(
  status: ScheduledEmailStatus
) {
  switch (status) {
    case "pending":
      return "Programmée";

    case "processing":
      return "En cours";

    case "sent":
      return "Envoyée";

    case "failed":
      return "Échec";

    case "cancelled":
      return "Annulée";

    default:
      return status;
  }
}

function getScheduledStatusClass(
  status: ScheduledEmailStatus
) {
  switch (status) {
    case "pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";

    case "processing":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";

    case "sent":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

    case "failed":
      return "border-red-500/30 bg-red-500/10 text-red-300";

    case "cancelled":
      return "border-zinc-700 bg-zinc-800 text-zinc-400";

    default:
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
  }
}

export default function CrmEmailPanel({
  entityType,
  entityId,
  defaultTo = "",
  defaultSubject = "",
  contactName = "",
}: {
  entityType: EntityType;
  entityId: string;
  defaultTo?: string;
  defaultSubject?: string;
  contactName?: string;
}) {
  const [emails, setEmails] =
    useState<EmailLog[]>([]);

  const [
    scheduledEmails,
    setScheduledEmails,
  ] = useState<ScheduledEmail[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    cancellingId,
    setCancellingId,
  ] = useState<string | null>(null);

  const [
    retryingId,
    setRetryingId,
  ] = useState<string | null>(null);

  const [
    syncingReplies,
    setSyncingReplies,
  ] = useState(false);

  const [
    syncMessage,
    setSyncMessage,
  ] = useState("");

  const [
    syncError,
    setSyncError,
  ] = useState("");

  const [refreshKey, setRefreshKey] =
    useState(0);

  const refreshPanel = useCallback(() => {
    setRefreshKey(
      (current) => current + 1
    );
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const params =
          new URLSearchParams({
            entityType,
            entityId,
          });

        const [
          historyResponse,
          scheduleResponse,
        ] = await Promise.all([
          fetch(
            `/api/google-gmail/history?${params.toString()}`,
            {
              cache: "no-store",
            }
          ),
          fetch(
            `/api/google-gmail/schedule?${params.toString()}`,
            {
              cache: "no-store",
            }
          ),
        ]);

        const [
          historyResult,
          scheduleResult,
        ] = await Promise.all([
          historyResponse.json(),
          scheduleResponse.json(),
        ]);

        if (!historyResponse.ok) {
          throw new Error(
            historyResult.error ||
              "Impossible de charger l’historique."
          );
        }

        if (!scheduleResponse.ok) {
          throw new Error(
            scheduleResult.error ||
              "Impossible de charger les relances programmées."
          );
        }

        setEmails(
          historyResult.emails || []
        );

        setScheduledEmails(
          scheduleResult.emails ||
            scheduleResult.scheduledEmails ||
            []
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger le suivi des e-mails."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [
    entityType,
    entityId,
    refreshKey,
  ]);

  async function syncEmailReplies() {
    setSyncingReplies(true);
    setSyncMessage("");
    setSyncError("");

    try {
      const response = await fetch(
        "/api/ovh-email-replies/sync",
        {
          method: "POST",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Impossible d’actualiser les réponses."
        );
      }

      const importedCount =
        Number(
          result.imported ??
            result.inserted ??
            result.synced ??
            result.created ??
            0
        );

      const scannedCount =
  Number(result.scanned || 0);

const matchedCount =
  Number(result.matched || 0);

const ignoredCount =
  Number(result.ignored || 0);

setSyncMessage(
  importedCount > 0
    ? `${importedCount} nouvelle${
        importedCount > 1 ? "s" : ""
      } réponse${
        importedCount > 1 ? "s" : ""
      } récupérée${
        importedCount > 1 ? "s" : ""
      }.`
    : `Aucune nouvelle réponse détectée — ${scannedCount} message(s) analysé(s), ${matchedCount} rapproché(s), ${ignoredCount} ignoré(s).`
);

      refreshPanel();
    } catch (syncFailure) {
      setSyncError(
        syncFailure instanceof Error
          ? syncFailure.message
          : "Impossible d’actualiser les réponses."
      );
    } finally {
      setSyncingReplies(false);
    }
  }

  async function retryScheduledEmail(
    scheduledEmailId: string
  ) {
    setRetryingId(
      scheduledEmailId
    );

    try {
      const response = await fetch(
        "/api/google-gmail/schedule",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: scheduledEmailId,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Impossible de réessayer cette relance."
        );
      }

      refreshPanel();
    } catch (retryError) {
      alert(
        retryError instanceof Error
          ? retryError.message
          : "Impossible de réessayer cette relance."
      );
    } finally {
      setRetryingId(null);
    }
  }

  async function cancelScheduledEmail(
    scheduledEmailId: string
  ) {
    const confirmed =
      window.confirm(
        "Annuler cette relance programmée ?"
      );

    if (!confirmed) {
      return;
    }

    setCancellingId(
      scheduledEmailId
    );

    try {
      const response = await fetch(
        `/api/google-gmail/schedule?id=${encodeURIComponent(
          scheduledEmailId
        )}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Impossible d’annuler cette relance."
        );
      }

      refreshPanel();
    } catch (cancelError) {
      alert(
        cancelError instanceof Error
          ? cancelError.message
          : "Impossible d’annuler cette relance."
      );
    } finally {
      setCancellingId(null);
    }
  }

  const totalReplies =
    emails.reduce(
      (total, email) =>
        total +
        (email.replies?.length || 0),
      0
    );

  return (
    <div className="space-y-8">
      <GmailComposer
        defaultTo={defaultTo}
        defaultSubject={defaultSubject}
        contactName={contactName}
        entityType={entityType}
        entityId={entityId}
        onSent={refreshPanel}
        onScheduled={refreshPanel}
      />

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Automatisation CRM
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Relances programmées
          </h2>

          <p className="mt-3 text-sm text-zinc-500">
            Les relances sont traitées
            automatiquement une fois par
            jour.
          </p>
        </div>

        {loading && (
          <p className="text-zinc-500">
            Chargement des relances...
          </p>
        )}

        {!loading &&
          !error &&
          scheduledEmails.length === 0 && (
            <p className="text-zinc-500">
              Aucune relance programmée
              pour cette fiche.
            </p>
          )}

        {!loading &&
          !error &&
          scheduledEmails.length > 0 && (
            <div className="space-y-4">
              {scheduledEmails.map(
                (email) => (
                  <article
                    key={email.id}
                    className="rounded-2xl border border-zinc-800 bg-black p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-zinc-500">
                          À :{" "}
                          {
                            email.recipient_email
                          }
                        </p>

                        <h3 className="mt-2 break-words text-lg font-semibold">
                          {email.subject}
                        </h3>

                        <p className="mt-2 text-sm font-medium text-amber-300">
                          Prévue le{" "}
                          {formatDate(
                            email.scheduled_for
                          )}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getScheduledStatusClass(
                          email.status
                        )}`}
                      >
                        {getScheduledStatusLabel(
                          email.status
                        )}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap break-words text-sm text-zinc-400">
                      {email.message}
                    </p>

                    {email.error_message && (
                      <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                        {
                          email.error_message
                        }
                      </p>
                    )}

                    {email.status ===
                      "pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          cancelScheduledEmail(
                            email.id
                          )
                        }
                        disabled={
                          cancellingId ===
                          email.id
                        }
                        className="mt-5 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancellingId ===
                        email.id
                          ? "Annulation..."
                          : "Annuler la relance"}
                      </button>
                    )}

                    {email.status ===
                      "failed" &&
                      email.error_message &&
                      Number(
                        email.attempts || 0
                      ) < 3 && (
                        <button
                          type="button"
                          onClick={() =>
                            retryScheduledEmail(
                              email.id
                            )
                          }
                          disabled={
                            retryingId ===
                            email.id
                          }
                          className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:border-amber-400 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {retryingId ===
                          email.id
                            ? "Nouvelle tentative..."
                            : "Réessayer l’envoi"}
                        </button>
                      )}
                  </article>
                )
              )}
            </div>
          )}
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
        <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Suivi CRM
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Historique des e-mails
            </h2>

            <p className="mt-3 text-sm text-zinc-500">
              {totalReplies === 0
                ? "Aucune réponse enregistrée."
                : `${totalReplies} réponse${
                    totalReplies > 1
                      ? "s"
                      : ""
                  } enregistrée${
                    totalReplies > 1
                      ? "s"
                      : ""
                  }.`}
            </p>
          </div>

          <button
            type="button"
            onClick={syncEmailReplies}
            disabled={syncingReplies}
            className="shrink-0 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {syncingReplies
              ? "Recherche des réponses..."
              : "Actualiser les réponses"}
          </button>
        </div>

        {syncMessage && (
          <p className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
            {syncMessage}
          </p>
        )}

        {syncError && (
          <p className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {syncError}
          </p>
        )}

        {loading && (
          <p className="text-zinc-500">
            Chargement de l’historique...
          </p>
        )}

        {!loading && error && (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          emails.length === 0 && (
            <p className="text-zinc-500">
              Aucun e-mail envoyé pour
              cette fiche.
            </p>
          )}

        {!loading &&
          !error &&
          emails.length > 0 && (
            <div className="space-y-5">
              {emails.map((email) => (
                <article
                  key={email.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-500">
                        À :{" "}
                        {
                          email.recipient_email
                        }
                      </p>

                      <h3 className="mt-2 break-words text-lg font-semibold">
                        {email.subject}
                      </h3>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                        email.status ===
                        "sent"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-red-500/30 bg-red-500/10 text-red-300"
                      }`}
                    >
                      {email.status ===
                      "sent"
                        ? "Envoyé"
                        : "Échec"}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words text-sm text-zinc-400">
                    {email.message}
                  </p>

                  <p className="mt-4 text-xs text-zinc-600">
                    {formatDate(
                      email.sent_at
                    )}
                  </p>

                  {email.error_message && (
                    <p className="mt-3 text-sm text-red-300">
                      {
                        email.error_message
                      }
                    </p>
                  )}

                  {email.replies &&
                    email.replies.length >
                      0 && (
                      <div className="mt-6 space-y-4 border-t border-zinc-800 pt-5">
                        <p className="text-sm font-semibold text-cyan-300">
                          {email.replies.length}{" "}
                          réponse
                          {email.replies
                            .length > 1
                            ? "s"
                            : ""}
                        </p>

                        {email.replies.map(
                          (reply) => (
                            <div
                              key={reply.id}
                              className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5"
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0">
                                  <p className="font-semibold text-cyan-200">
                                    {reply.sender_name ||
                                      reply.sender_email}
                                  </p>

                                  {reply.sender_name && (
                                    <p className="mt-1 break-all text-xs text-zinc-500">
                                      {
                                        reply.sender_email
                                      }
                                    </p>
                                  )}

                                  {reply.subject && (
                                    <p className="mt-2 break-words text-sm font-medium text-zinc-300">
                                      {
                                        reply.subject
                                      }
                                    </p>
                                  )}
                                </div>

                                <p className="shrink-0 text-xs text-zinc-600">
                                  {formatDate(
                                    reply.received_at
                                  )}
                                </p>
                              </div>

                              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                                {reply.message_text ||
                                  "Réponse reçue sans contenu texte."}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </article>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}