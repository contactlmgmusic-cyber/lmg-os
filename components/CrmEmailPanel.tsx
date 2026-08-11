"use client";

import {
  useEffect,
  useState,
} from "react";
import GmailComposer from "@/components/GmailComposer";

type EntityType =
  | "media"
  | "influenceur"
  | "partenaire"
  | "prospect";

type EmailLog = {
  id: string;
  recipient_email: string;
  subject: string;
  message: string;
  status: "sent" | "failed";
  error_message: string | null;
  sent_by: string;
  sent_at: string;
};

function formatDate(date: string) {
  return new Date(
    date
  ).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
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

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshKey, setRefreshKey] =
    useState(0);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const params =
          new URLSearchParams({
            entityType,
            entityId,
          });

        const response = await fetch(
          `/api/google-gmail/history?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Impossible de charger l’historique."
          );
        }

        setEmails(
          result.emails || []
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger l’historique."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [
    entityType,
    entityId,
    refreshKey,
  ]);

  return (
    <div className="space-y-8">
      <GmailComposer
        defaultTo={defaultTo}
        defaultSubject={
          defaultSubject
        }
        contactName={contactName}
        entityType={entityType}
        entityId={entityId}
        onSent={() =>
          setRefreshKey(
            (current) =>
              current + 1
          )
        }
      />

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Suivi CRM
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Historique des e-mails
          </h2>
        </div>

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
            <div className="space-y-4">
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
                </article>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}