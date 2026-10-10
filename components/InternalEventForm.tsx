"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabase-browser";

type Profile = { id: string; nom: string | null; full_name?: string | null };
export type InternalEventInitial = {
  id: string; titre: string; type: string; description: string | null; date_debut: string; date_fin: string | null;
  toute_la_journee: boolean; lieu: string | null; lien_visio: string | null; statut: string; participant_ids: string[]; reminder_minutes: number;
};

const eventTypes = ["Réunion", "Rendez-vous", "Session studio", "Shooting", "Événement d’équipe", "Formation", "Autre"];
const reminderOptions = [[0, "Aucun rappel"], [15, "15 minutes avant"], [30, "30 minutes avant"], [60, "1 heure avant"], [120, "2 heures avant"], [1440, "1 jour avant"]] as const;

export default function InternalEventForm({ profiles, mobile = false, initial }: { profiles: Profile[]; mobile?: boolean; initial?: InternalEventInitial }) {
  const router = useRouter();
  const [titre, setTitre] = useState(initial?.titre || ""); const [type, setType] = useState(initial?.type || "Réunion"); const [description, setDescription] = useState(initial?.description || "");
  const [start, setStart] = useState(toLocalInput(initial?.date_debut)); const [end, setEnd] = useState(toLocalInput(initial?.date_fin)); const [allDay, setAllDay] = useState(initial?.toute_la_journee || false);
  const [lieu, setLieu] = useState(initial?.lieu || ""); const [video, setVideo] = useState(initial?.lien_visio || ""); const [participants, setParticipants] = useState<string[]>(initial?.participant_ids || []);
  const [status, setStatus] = useState(initial?.statut || "Confirmé"); const [reminder, setReminder] = useState(initial?.reminder_minutes ?? 60);
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (saving) return; setSaving(true); setError("");
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (!user) { setError("Session expirée."); setSaving(false); return; }
    const payload = { titre: titre.trim(), type, description: description.trim() || null, date_debut: start, date_fin: end || null, toute_la_journee: allDay, lieu: lieu.trim() || null, lien_visio: video.trim() || null, participant_ids: participants, statut: status, reminder_minutes: reminder, reminder_sent_at: null };
    const query = initial ? supabaseBrowser.from("internal_events").update(payload).eq("id", initial.id) : supabaseBrowser.from("internal_events").insert({ ...payload, created_by: user.id });
    const { data, error: saveError } = await query.select("id").single();
    if (saveError || !data) { setError(saveError?.message || "Impossible d’enregistrer l’événement."); setSaving(false); return; }

    const recipients = participants.filter((id) => id !== user.id);
    if (recipients.length) {
      await supabaseBrowser.from("notifications").insert(recipients.map((userId) => ({ user_id: userId, created_by: user.id, type: "Agenda", titre: initial ? `Événement modifié : ${titre.trim()}` : `Nouvel événement : ${titre.trim()}`, description: `${formatNotificationDate(start)}${lieu.trim() ? ` · ${lieu.trim()}` : ""}`, lien: `/evenements/${data.id}`, niveau: "Important", lu: false, is_read: false })));
    }
    router.replace(mobile ? `/mobile/agenda/interne/${data.id}` : `/evenements/${data.id}`); router.refresh();
  }

  const field = "mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-[#f2b705]";
  return <form onSubmit={submit} className="space-y-5"><div><label className="text-xs font-bold text-zinc-400">Titre</label><input required maxLength={160} value={titre} onChange={(e) => setTitre(e.target.value)} className={field} placeholder="Réunion hebdomadaire LMG" /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="text-xs font-bold text-zinc-400">Type</label><select value={type} onChange={(e) => setType(e.target.value)} className={field}>{eventTypes.map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="text-xs font-bold text-zinc-400">Statut</label><select value={status} onChange={(e) => setStatus(e.target.value)} className={field}><option>Confirmé</option><option>À confirmer</option><option>Reporté</option><option>Annulé</option></select></div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="text-xs font-bold text-zinc-400">Début</label><input required type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={field} /></div><div><label className="text-xs font-bold text-zinc-400">Fin</label><input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className={field} /></div></div><label className="flex items-center gap-3 text-sm text-zinc-400"><input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 accent-[#f2b705]" />Toute la journée</label><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="text-xs font-bold text-zinc-400">Lieu</label><input value={lieu} onChange={(e) => setLieu(e.target.value)} className={field} placeholder="Bureau, studio…" /></div><div><label className="text-xs font-bold text-zinc-400">Lien visio</label><input type="url" value={video} onChange={(e) => setVideo(e.target.value)} className={field} placeholder="https://…" /></div></div><div><label className="text-xs font-bold text-zinc-400">Rappel</label><select value={reminder} onChange={(e) => setReminder(Number(e.target.value))} className={field}>{reminderOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><label className="text-xs font-bold text-zinc-400">Notes</label><textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={field} /></div><div><p className="text-xs font-bold text-zinc-400">Participants</p><div className="mt-3 flex flex-wrap gap-2">{profiles.map((profile) => { const active = participants.includes(profile.id); const name = profile.nom || profile.full_name || "Membre LMG"; return <button type="button" key={profile.id} onClick={() => setParticipants((current) => active ? current.filter((id) => id !== profile.id) : [...current, profile.id])} className={`rounded-full border px-3 py-2 text-xs font-bold ${active ? "border-[#f2b705] bg-[#f2b705]/10 text-[#f2b705]" : "border-zinc-800 text-zinc-500"}`}>{name}</button>; })}</div></div>{error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}<button disabled={saving} className="w-full rounded-xl bg-[#f2b705] px-5 py-4 font-black text-black disabled:opacity-50">{saving ? "Enregistrement…" : initial ? "Enregistrer les modifications" : "Créer l’événement"}</button></form>;
}

function toLocalInput(value?: string | null) { if (!value) return ""; const date = new Date(value); const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }
function formatNotificationDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
