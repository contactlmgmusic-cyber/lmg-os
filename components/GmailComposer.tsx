"use client";

import {
  useEffect,
  useState,
} from "react";

type EntityType =
  | "media"
  | "influenceur"
  | "partenaire"
  | "prospect";

type EmailTemplate = {
  id: string;
  name: string;
  entity_type: EntityType | null;
  subject: string;
  message: string;
};

export default function GmailComposer({
  defaultTo = "",
  defaultSubject = "",
  contactName = "",
  entityType,
  entityId,
  onSent,
}: {
  defaultTo?: string;
  defaultSubject?: string;
  contactName?: string;
  entityType?: EntityType;
  entityId?: string;
  onSent?: () => void;
}) {
  const [to, setTo] =
    useState(defaultTo);

  const [subject, setSubject] =
    useState(defaultSubject);

  const [message, setMessage] =
    useState("");

  const [templates, setTemplates] =
    useState<EmailTemplate[]>([]);

  const [
    selectedTemplate,
    setSelectedTemplate,
  ] = useState("");

  const [
    templatesLoading,
    setTemplatesLoading,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [status, setStatus] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    setTo(defaultTo);
  }, [defaultTo]);

  useEffect(() => {
    setSubject(defaultSubject);
  }, [defaultSubject]);

  useEffect(() => {
    if (!entityType) {
      setTemplates([]);
      return;
    }

    async function loadTemplates() {
      setTemplatesLoading(true);

      try {
        const params =
          new URLSearchParams({
            entityType:
              entityType as string,
          });

        const response = await fetch(
          `/api/google-gmail/templates?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Impossible de charger les modèles."
          );
        }

        setTemplates(
          result.templates || []
        );
      } catch (error) {
        console.error(
          "Erreur chargement modèles :",
          error
        );

        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    }

    loadTemplates();
  }, [entityType]);

  function applyTemplate(
    templateId: string
  ) {
    setSelectedTemplate(
      templateId
    );

    const template =
      templates.find(
        (item) =>
          item.id === templateId
      );

    if (!template) {
      return;
    }

    const contact =
      contactName ||
      "Madame, Monsieur";

    const replaceVariables = (
      value: string
    ) =>
      value
        .replaceAll(
          "{{contact}}",
          contact
        )
        .replaceAll(
          "{{nom}}",
          contact
        );

    setSubject(
      replaceVariables(
        template.subject
      )
    );

    setMessage(
      replaceVariables(
        template.message
      )
    );

    setStatus("");
  }

  async function sendEmail(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSending(true);
    setStatus("");
    setSuccess(false);

    try {
      const response = await fetch(
        "/api/google-gmail/send",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            to,
            subject,
            message,
            entityType,
            entityId,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Impossible d’envoyer l’e-mail."
        );
      }

      setSuccess(true);

      setStatus(
        "L’e-mail a bien été envoyé depuis Gmail LMG."
      );

      setMessage("");
      setSelectedTemplate("");

      onSent?.();
    } catch (error) {
      setSuccess(false);

      setStatus(
        error instanceof Error
          ? error.message
          : "L’envoi de l’e-mail a échoué."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Communication
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Envoyer un e-mail
        </h2>

        <p className="mt-3 text-zinc-400">
          Envoi depuis la boîte Gmail
          centrale de Legacy Music Group
          {contactName
            ? ` vers ${contactName}.`
            : "."}
        </p>
      </div>

      <form
        onSubmit={sendEmail}
        className="space-y-5"
      >
        {entityType && (
          <div>
            <label
              htmlFor="gmail-template"
              className="mb-2 block text-sm text-zinc-400"
            >
              Modèle d’e-mail
            </label>

            <select
              id="gmail-template"
              value={selectedTemplate}
              onChange={(event) =>
                applyTemplate(
                  event.target.value
                )
              }
              disabled={
                templatesLoading
              }
              className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition focus:border-zinc-600 disabled:opacity-50"
            >
              <option value="">
                {templatesLoading
                  ? "Chargement des modèles..."
                  : "Sélectionner un modèle"}
              </option>

              {templates.map(
                (template) => (
                  <option
                    key={template.id}
                    value={template.id}
                  >
                    {template.name}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="gmail-to"
            className="mb-2 block text-sm text-zinc-400"
          >
            Destinataire
          </label>

          <input
            id="gmail-to"
            type="email"
            value={to}
            onChange={(event) =>
              setTo(event.target.value)
            }
            placeholder="contact@email.com"
            required
            className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition focus:border-zinc-600"
          />
        </div>

        <div>
          <label
            htmlFor="gmail-subject"
            className="mb-2 block text-sm text-zinc-400"
          >
            Objet
          </label>

          <input
            id="gmail-subject"
            type="text"
            value={subject}
            onChange={(event) =>
              setSubject(
                event.target.value
              )
            }
            placeholder="Objet de l’e-mail"
            maxLength={200}
            required
            className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition focus:border-zinc-600"
          />
        </div>

        <div>
          <label
            htmlFor="gmail-message"
            className="mb-2 block text-sm text-zinc-400"
          >
            Message
          </label>

          <textarea
            id="gmail-message"
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            placeholder="Écris ton message..."
            rows={12}
            maxLength={50000}
            required
            className="w-full resize-y rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none transition focus:border-zinc-600"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
        >
          {sending
            ? "Envoi en cours..."
            : "Envoyer avec Gmail"}
        </button>
      </form>

      {status && (
        <p
          className={`mt-6 rounded-2xl border p-4 ${
            success
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {status}
        </p>
      )}
    </section>
  );
}