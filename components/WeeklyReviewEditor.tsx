"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Option = { id: string; label: string };
type Decision = { id: string; decision: string; deadline: string | null; owner?: { nom?: string | null; full_name?: string | null } | null; project?: { titre?: string | null } | null };
type Review = { id: string; statut: string; meeting_date: string | null; compte_rendu: string | null; priorites_suivantes: string | null } | null;

export default function WeeklyReviewEditor({ weekStart, review, decisions, profiles, projects }: { weekStart: string; review: Review; decisions: Decision[]; profiles: Option[]; projects: Option[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ statut: review?.statut || "À préparer", meeting_date: review?.meeting_date?.slice(0, 16) || "", compte_rendu: review?.compte_rendu || "", priorites_suivantes: review?.priorites_suivantes || "" });
  const [decision, setDecision] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveReview() {
    setSaving(true);
    const payload = { week_start: weekStart, statut: form.statut, meeting_date: form.meeting_date ? new Date(form.meeting_date).toISOString() : null, compte_rendu: form.compte_rendu || null, priorites_suivantes: form.priorites_suivantes || null, updated_at: new Date().toISOString() };
    const result = review?.id ? await supabaseBrowser.from("weekly_reviews").update(payload).eq("id", review.id) : await supabaseBrowser.from("weekly_reviews").insert(payload);
    setSaving(false);
    if (result.error) return alert(result.error.message);
    router.refresh();
  }

  async function addDecision() {
    if (!decision.trim()) return;
    setSaving(true);
    let reviewId = review?.id;
    if (!reviewId) {
      const { data, error } = await supabaseBrowser.from("weekly_reviews").insert({ week_start: weekStart }).select("id").single();
      if (error || !data) { setSaving(false); return alert(error?.message || "Impossible de créer la revue."); }
      reviewId = data.id;
    }
    const { error } = await supabaseBrowser.from("weekly_review_decisions").insert({ review_id: reviewId, decision: decision.trim(), owner_id: ownerId || null, internal_project_id: projectId || null, deadline: deadline || null });
    setSaving(false);
    if (error) return alert(error.message);
    setDecision(""); setOwnerId(""); setProjectId(""); setDeadline(""); router.refresh();
  }

  async function removeDecision(id: string) {
    if (!confirm("Supprimer cette décision ?")) return;
    const { error } = await supabaseBrowser.from("weekly_review_decisions").delete().eq("id", id);
    if (error) return alert(error.message);
    router.refresh();
  }

  const field = "w-full rounded-xl border border-zinc-800 bg-black p-3 text-sm text-white outline-none focus:border-zinc-600";
  return <div className="space-y-6">
    <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
      <div className="grid gap-4 md:grid-cols-2"><label><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Statut</span><select className={field} value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>{["À préparer","Prête","Tenue","Clôturée"].map((item) => <option key={item}>{item}</option>)}</select></label><label><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Date de réunion</span><input type="datetime-local" className={field} value={form.meeting_date} onChange={(e) => setForm({ ...form, meeting_date: e.target.value })} /></label></div>
      <label className="mt-5 block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Compte rendu</span><textarea className={`${field} min-h-48`} value={form.compte_rendu} onChange={(e) => setForm({ ...form, compte_rendu: e.target.value })} placeholder="Points abordés, arbitrages, blocages remontés…" /></label>
      <label className="mt-5 block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Priorités de la semaine suivante</span><textarea className={`${field} min-h-32`} value={form.priorites_suivantes} onChange={(e) => setForm({ ...form, priorites_suivantes: e.target.value })} placeholder="Les 3 à 5 priorités à ne pas perdre de vue…" /></label>
      <button onClick={saveReview} disabled={saving} className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer la revue"}</button>
    </section>

    <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Décisions</p><h2 className="mt-2 text-2xl font-bold">Ce qui a été décidé</h2><p className="mt-2 text-sm text-zinc-500">Une décision reste ici. Si elle demande une action, crée ensuite une vraie tâche.</p></div>
      <div className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,2fr)_1fr_1fr_160px_auto]"><input className={field} value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="Décision ou arbitrage…" /><select className={field} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}><option value="">Sans responsable</option>{profiles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><select className={field} value={projectId} onChange={(e) => setProjectId(e.target.value)}><option value="">Sans projet</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><input type="date" className={field} value={deadline} onChange={(e) => setDeadline(e.target.value)} /><button onClick={addDecision} disabled={saving || !decision.trim()} className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-bold text-black disabled:opacity-40">Ajouter</button></div>
      <div className="mt-6">{!decisions.length ? <p className="rounded-xl border border-dashed border-zinc-800 p-7 text-center text-sm text-zinc-600">Aucune décision enregistrée.</p> : decisions.map((item) => <div key={item.id} className="flex items-start gap-4 border-b border-zinc-900 py-4 last:border-0"><div className="min-w-0 flex-1"><p className="font-semibold">{item.decision}</p><p className="mt-2 text-xs text-zinc-600">{item.owner?.nom || item.owner?.full_name || "Sans responsable"} · {item.project?.titre || "Sans projet"}{item.deadline ? ` · ${formatDate(item.deadline)}` : ""}</p></div><button onClick={() => removeDecision(item.id)} className="text-xs text-zinc-600 hover:text-red-400">Supprimer</button></div>)}</div>
    </section>
  </div>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
