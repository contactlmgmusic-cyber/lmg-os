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
  event_type: "created" | "status_changed" | "assignment_changed" | "action_updated" | "interview_scheduled" | "archived" | "restored";
  from_status: string | null;
  to_status: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
  actor_name: string | null;
};

type Note = {
  id: string;
  body: string;
  created_at: string;
  author_name: string | null;
};

type StaffMember = { id: string; name: string };
type Interview = {
  id: string;
  date_debut: string;
  date_fin: string | null;
  lieu: string | null;
  lien_visio: string | null;
  participant_ids: string[];
  reminder_minutes: number;
} | null;

export default function CareersApplicationManager({
  id,
  initialStatus,
  legacyNotes,
  events,
  notes,
  staff,
  initialAssignee,
  initialNextAction,
  initialNextActionAt,
  initialInterview,
  initialArchivedAt,
  retentionUntil,
}: {
  id: string;
  initialStatus: string;
  legacyNotes: string | null;
  events: Event[];
  notes: Note[];
  staff: StaffMember[];
  initialAssignee: string | null;
  initialNextAction: string | null;
  initialNextActionAt: string | null;
  initialInterview: Interview;
  initialArchivedAt: string | null;
  retentionUntil: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [assignee, setAssignee] = useState(initialAssignee || "");
  const [nextAction, setNextAction] = useState(initialNextAction || "");
  const [nextActionAt, setNextActionAt] = useState(toLocalInput(initialNextActionAt));
  const [interviewStart, setInterviewStart] = useState(toLocalInput(initialInterview?.date_debut));
  const [interviewEnd, setInterviewEnd] = useState(toLocalInput(initialInterview?.date_fin));
  const [interviewLocation, setInterviewLocation] = useState(initialInterview?.lieu || "");
  const [videoLink, setVideoLink] = useState(initialInterview?.lien_visio || "");
  const [participants, setParticipants] = useState<string[]>(initialInterview?.participant_ids || []);
  const [reminderMinutes, setReminderMinutes] = useState(String(initialInterview?.reminder_minutes ?? 60));

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

  async function submit(payload: Record<string, unknown>) {
    setSaving(true); setError(""); setSaved(false);
    try {
      const response = await fetch(`/api/careers/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossible d'enregistrer.");
      setSaved(true); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer.");
    } finally { setSaving(false); }
  }

  function savePlanning() {
    return submit({
      mode: "planning",
      assignedTo: assignee || null,
      nextAction,
      nextActionAt: nextActionAt ? new Date(nextActionAt).toISOString() : null,
    });
  }

  function saveInterview() {
    if (!interviewStart || !interviewEnd) {
      setError("Renseignez le début et la fin de l’entretien.");
      return;
    }
    return submit({
      mode: "interview",
      start: new Date(interviewStart).toISOString(),
      end: new Date(interviewEnd).toISOString(),
      location: interviewLocation,
      videoLink,
      participantIds: participants,
      reminderMinutes: Number(reminderMinutes),
    });
  }

  async function toggleArchive() {
    await submit({ mode: "archive", archived: !initialArchivedAt });
  }

  async function deleteApplication() {
    if (!window.confirm("Supprimer définitivement ce dossier et son CV ? Cette action est irréversible.")) return;
    setSaving(true); setError("");
    const response = await fetch(`/api/careers/applications/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Suppression impossible."); setSaving(false); return; }
    router.push("/recrutement/archives"); router.refresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <label className="mb-3 block text-sm font-medium">Statut</label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50">
          {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </section>

      <section>
        <label className="mb-3 block text-sm font-medium">Ajouter une note interne</label>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={5000} rows={5} placeholder="Compte-rendu, points à vérifier, retour entretien…" className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-amber-400/50" />
        <p className="mt-2 text-right text-xs text-muted-foreground">{note.length}/5000</p>
      </section>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {saved && <p role="status" className="text-sm text-emerald-500">Modifications enregistrées.</p>}

      <button type="button" onClick={save} disabled={saving || (status === initialStatus && !note.trim())} className="w-full rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50">
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      <section className="border-t border-white/10 pt-7">
        <h3 className="text-sm font-semibold">Pilotage interne</h3>
        <div className="mt-4 space-y-4">
          <label className="block text-xs text-zinc-400">Responsable
            <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50">
              <option value="">Non attribuée</option>
              {staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </label>
          <label className="block text-xs text-zinc-400">Prochaine action
            <input value={nextAction} onChange={(event) => setNextAction(event.target.value)} maxLength={500} placeholder="Ex. Appeler le candidat" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-400/50" />
          </label>
          <label className="block text-xs text-zinc-400">Échéance
            <input type="datetime-local" value={nextActionAt} onChange={(event) => setNextActionAt(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
          </label>
          <button type="button" onClick={savePlanning} disabled={saving} className="w-full rounded-xl border border-amber-400/30 px-5 py-3 text-sm font-semibold text-amber-300 disabled:opacity-50">Enregistrer le pilotage</button>
        </div>
      </section>

      <section className="border-t border-white/10 pt-7">
        <h3 className="text-sm font-semibold">Conservation du dossier</h3>
        <p className="mt-2 text-xs leading-5 text-zinc-500">{initialArchivedAt ? `Archivé${retentionUntil ? ` · conservation prévue jusqu’au ${formatDate(retentionUntil)}` : ""}` : "Le dossier reste visible dans le pipeline actif."}</p>
        <button type="button" onClick={toggleArchive} disabled={saving} className="mt-4 w-full rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-300 disabled:opacity-50">{initialArchivedAt ? "Restaurer le dossier" : "Archiver le dossier"}</button>
        {initialArchivedAt && <button type="button" onClick={deleteApplication} disabled={saving} className="mt-3 w-full rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-400 disabled:opacity-50">Supprimer définitivement</button>}
      </section>

      <section className="border-t border-white/10 pt-7">
        <h3 className="text-sm font-semibold">Entretien</h3>
        <div className="mt-4 grid gap-4">
          <label className="text-xs text-zinc-400">Début<input type="datetime-local" value={interviewStart} onChange={(event) => setInterviewStart(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" /></label>
          <label className="text-xs text-zinc-400">Fin<input type="datetime-local" value={interviewEnd} onChange={(event) => setInterviewEnd(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" /></label>
          <label className="text-xs text-zinc-400">Lieu<input value={interviewLocation} onChange={(event) => setInterviewLocation(event.target.value)} placeholder="Bureau, studio…" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-600" /></label>
          <label className="text-xs text-zinc-400">Lien visioconférence<input type="url" value={videoLink} onChange={(event) => setVideoLink(event.target.value)} placeholder="https://…" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-600" /></label>
          <div>
            <p className="text-xs text-zinc-400">Participants internes</p>
            <div className="mt-2 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
              {staff.map((person) => <label key={person.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={participants.includes(person.id)} onChange={(event) => setParticipants((current) => event.target.checked ? [...new Set([...current, person.id])] : current.filter((id) => id !== person.id))} />{person.name}</label>)}
            </div>
          </div>
          <label className="text-xs text-zinc-400">Rappel
            <select value={reminderMinutes} onChange={(event) => setReminderMinutes(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
              <option value="0">Aucun</option><option value="15">15 minutes avant</option><option value="30">30 minutes avant</option><option value="60">1 heure avant</option><option value="120">2 heures avant</option><option value="1440">1 jour avant</option>
            </select>
          </label>
          <button type="button" onClick={saveInterview} disabled={saving} className="w-full rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{initialInterview ? "Mettre à jour l’entretien" : "Planifier l’entretien"}</button>
        </div>
      </section>

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
              <div key={item.id} className="relative pl-5 text-sm before:absolute before:left-0 before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-amber-400">
              <p>{eventLabel(item)}</p>
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
  return <article className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="whitespace-pre-line text-sm leading-6">{text}</p><p className="mt-3 text-xs text-zinc-500">{meta}</p></article>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function eventLabel(item: Event) {
  if (item.event_type === "created") return "Candidature reçue";
  if (item.event_type === "assignment_changed") return "Responsable du dossier modifié";
  if (item.event_type === "action_updated") return "Prochaine action mise à jour";
  if (item.event_type === "interview_scheduled") return "Entretien planifié ou déplacé";
  if (item.event_type === "archived") return "Dossier archivé";
  if (item.event_type === "restored") return "Dossier restauré";
  return `${statusLabels[item.from_status || ""] || item.from_status} → ${statusLabels[item.to_status || ""] || item.to_status}`;
}
