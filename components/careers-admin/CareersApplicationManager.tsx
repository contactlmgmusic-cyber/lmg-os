"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  ["new", "Nouvelle"],
  ["review", "À étudier"],
  ["interview", "Entretien"],
  ["selected", "Retenue"],
  ["rejected", "Refusée"],
  ["talent_pool", "Vivier"],
] as const;

const statusLabels: Record<string, string> = Object.fromEntries(statuses);

type Event = {
  id: string;
  event_type: "created" | "status_changed";
  from_status: string | null;
  to_status: string | null;
  created_at: string;
  actor_name: string | null;
};

type Note = {
  id: string;
  body: string;
  created_at: string;
  author_name: string | null;
};

export default function CareersApplicationManager({
  id,
  initialStatus,
  legacyNotes,
  events,
  notes,
}: {
  id: string;
  initialStatus: string;
  legacyNotes: string | null;
  events: Event[];
  notes: Note[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch(`/api/careers/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossible d'enregistrer.");
      setNote("");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <label className="mb-3 block text-sm font-medium">Statut</label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border bg-background px-4 py-3 text-sm">
          {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </section>

      <section>
        <label className="mb-3 block text-sm font-medium">Ajouter une note interne</label>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={5000} rows={5} placeholder="Compte-rendu, points à vérifier, retour entretien…" className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm leading-6 outline-none" />
        <p className="mt-2 text-right text-xs text-muted-foreground">{note.length}/5000</p>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Modifications enregistrées.</p>}

      <button type="button" onClick={save} disabled={saving || (status === initialStatus && !note.trim())} className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      <section className="border-t pt-7">
        <h3 className="text-sm font-semibold">Notes internes</h3>
        <div className="mt-4 space-y-3">
          {legacyNotes && <TimelineCard text={legacyNotes} meta="Note historique" />}
          {notes.map((item) => <TimelineCard key={item.id} text={item.body} meta={`${item.author_name || "Équipe LMG"} · ${formatDate(item.created_at)}`} />)}
          {!legacyNotes && notes.length === 0 && <p className="text-sm text-muted-foreground">Aucune note pour le moment.</p>}
        </div>
      </section>

      <section className="border-t pt-7">
        <h3 className="text-sm font-semibold">Historique</h3>
        <div className="mt-4 space-y-4">
          {events.map((item) => (
            <div key={item.id} className="relative pl-5 text-sm before:absolute before:left-0 before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-primary">
              <p>{item.event_type === "created" ? "Candidature reçue" : `${statusLabels[item.from_status || ""] || item.from_status} → ${statusLabels[item.to_status || ""] || item.to_status}`}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.actor_name || "Système LMG"} · {formatDate(item.created_at)}</p>
            </div>
          ))}
          {events.length === 0 && <p className="text-sm text-muted-foreground">L’historique commencera après l’application de la migration.</p>}
        </div>
      </section>
    </div>
  );
}

function TimelineCard({ text, meta }: { text: string; meta: string }) {
  return <article className="rounded-xl border bg-muted/30 p-4"><p className="whitespace-pre-line text-sm leading-6">{text}</p><p className="mt-3 text-xs text-muted-foreground">{meta}</p></article>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
