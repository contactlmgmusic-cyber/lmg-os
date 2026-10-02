"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SubmitMode = "draft" | "published";

export default function CareersJobForm() {
  const router = useRouter();

  const [saving, setSaving] = useState<SubmitMode | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    status: SubmitMode
  ) {
    event.preventDefault();

    setSaving(status);
    setError("");

    const form = new FormData(event.currentTarget);

    const payload = {
      title: form.get("title"),
      department: form.get("department"),
      employment_type: form.get("employment_type"),
      location: form.get("location"),
      remote_policy: form.get("remote_policy"),
      short_description: form.get("short_description"),
      description: form.get("description"),
      responsibilities: form.get("responsibilities"),
      profile: form.get("profile"),
      benefits: form.get("benefits"),
      application_email: form.get("application_email"),
      closes_at: form.get("closes_at"),
      status,
    };

    try {
      const response = await fetch("/api/careers/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Impossible d'enregistrer l'offre."
        );
      }

      router.push("/recrutement/offres");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
      setSaving(null);
    }
  }

  const field =
    "mt-2 w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40";

  const textarea =
    "mt-2 min-h-[150px] w-full resize-y rounded-lg border bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-foreground/40";

  return (
    <form
      onSubmit={(event) => handleSubmit(event, "draft")}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Informations principales
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Informations visibles dans la liste des opportunités.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="text-sm font-medium">
              Intitulé du poste *
            </span>
            <input
              name="title"
              required
              placeholder="Ex. Assistant·e Communication"
              className={field}
            />
          </label>

          <label>
            <span className="text-sm font-medium">Univers *</span>
            <select
              name="department"
              required
              defaultValue=""
              className={field}
            >
              <option value="" disabled>
                Sélectionner
              </option>
              <option value="music">Music</option>
              <option value="creative">Creative</option>
              <option value="business">Business</option>
              <option value="tech_digital">
                Tech & Digital
              </option>
            </select>
          </label>

          <label>
            <span className="text-sm font-medium">
              Type de contrat *
            </span>
            <select
              name="employment_type"
              required
              defaultValue=""
              className={field}
            >
              <option value="" disabled>
                Sélectionner
              </option>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="stage">Stage</option>
              <option value="alternance">Alternance</option>
              <option value="freelance">Freelance</option>
              <option value="project">Mission / Projet</option>
            </select>
          </label>

          <label>
            <span className="text-sm font-medium">Localisation</span>
            <input
              name="location"
              placeholder="Ex. Lille, France"
              className={field}
            />
          </label>

          <label>
            <span className="text-sm font-medium">
              Organisation du travail
            </span>
            <select
              name="remote_policy"
              defaultValue=""
              className={field}
            >
              <option value="">Non précisé</option>
              <option value="onsite">Sur site</option>
              <option value="hybrid">Hybride</option>
              <option value="remote">Remote</option>
            </select>
          </label>

          <label className="md:col-span-2">
            <span className="text-sm font-medium">
              Résumé de l&apos;offre
            </span>
            <textarea
              name="short_description"
              rows={3}
              maxLength={500}
              placeholder="Quelques lignes pour présenter rapidement l'opportunité."
              className={textarea}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Contenu de l&apos;offre
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Présentez le poste, les missions et le profil recherché.
          </p>
        </div>

        <div className="space-y-6">
          <label className="block">
            <span className="text-sm font-medium">
              À propos du poste *
            </span>
            <textarea
              name="description"
              required
              placeholder="Présentez le contexte, l'équipe et le rôle..."
              className={textarea}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Missions
            </span>
            <textarea
              name="responsibilities"
              placeholder={"Une mission par ligne, par exemple :\nCoordonner les contenus...\nParticiper aux campagnes..."}
              className={textarea}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Profil recherché
            </span>
            <textarea
              name="profile"
              placeholder="Compétences, expérience, qualités recherchées..."
              className={textarea}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Ce que LMG propose
            </span>
            <textarea
              name="benefits"
              placeholder="Environnement, avantages, expérience proposée..."
              className={textarea}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Candidature & publication
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label>
            <span className="text-sm font-medium">
              Email de contact
            </span>
            <input
              type="email"
              name="application_email"
              placeholder="careers@lmgmusic.fr"
              className={field}
            />
          </label>

          <label>
            <span className="text-sm font-medium">
              Date de clôture
            </span>
            <input
              type="date"
              name="closes_at"
              className={field}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={saving !== null}
          className="rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          {saving === "draft"
            ? "Enregistrement..."
            : "Enregistrer en brouillon"}
        </button>

        <button
          type="button"
          disabled={saving !== null}
          onClick={(event) => {
            const form = event.currentTarget.form;
            if (!form) return;

            if (!form.reportValidity()) return;

            handleSubmit(
              {
                preventDefault() {},
                currentTarget: form,
              } as FormEvent<HTMLFormElement>,
              "published"
            );
          }}
          className="rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {saving === "published"
            ? "Publication..."
            : "Publier l'offre"}
        </button>
      </div>
    </form>
  );
}
