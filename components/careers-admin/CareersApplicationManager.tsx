"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  ["new", "Nouvelle"],
  ["review", "À étudier"],
  ["interview", "Entretien"],
  ["selected", "Retenue"],
  ["rejected", "Refusée"],
] as const;

export default function CareersApplicationManager({
  id,
  initialStatus,
  initialNotes,
}: {
  id: string;
  initialStatus: string;
  initialNotes: string | null;
}) {
  const router = useRouter();

  const [status, setStatus] =
    useState(initialStatus);

  const [notes, setNotes] =
    useState(initialNotes ?? "");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saved, setSaved] =
    useState(false);

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch(
        `/api/careers/applications/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            internal_notes: notes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Impossible d'enregistrer."
        );
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <label className="mb-3 block text-sm font-medium">
          Statut
        </label>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="w-full rounded-xl border bg-background px-4 py-3 text-sm"
        >
          {statuses.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium">
          Notes internes
        </label>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          rows={8}
          placeholder="Compte-rendu, points à vérifier, retour entretien..."
          className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm leading-6 outline-none"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

      {saved && (
        <p className="text-sm text-emerald-600">
          Modifications enregistrées.
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {saving
          ? "Enregistrement..."
          : "Enregistrer"}
      </button>
    </div>
  );
}
