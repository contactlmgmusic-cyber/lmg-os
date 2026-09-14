"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { INTERNAL_PROJECT_POLES } from "@/lib/internal-project-taxonomy";

type Option = { id: string; label: string };
type Objective = {
  id: string; titre: string; description: string | null; pole: string; trimestre: string;
  indicateur: string; unite: string; valeur_initiale: number; valeur_actuelle: number;
  valeur_cible: number; statut: string; niveau_risque: string; deadline: string;
  owner?: { nom?: string | null; full_name?: string | null } | null;
  project?: { id?: string; titre?: string | null } | null;
};

export default function CompanyObjectivesWorkspace({ objectives, profiles, projects, currentQuarter, quarterEnd }: { objectives: Objective[]; profiles: Option[]; projects: Option[]; currentQuarter: string; quarterEnd: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titre: "", description: "", pole: "Direction", trimestre: currentQuarter, indicateur: "", unite: "%", valeur_initiale: "0", valeur_actuelle: "0", valeur_cible: "100", statut: "En cours", niveau_risque: "Maîtrisé", owner_id: "", internal_project_id: "", deadline: quarterEnd });

  async function createObjective(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    const { error } = await supabaseBrowser.from("company_objectives").insert({ ...form, valeur_initiale: Number(form.valeur_initiale), valeur_actuelle: Number(form.valeur_actuelle), valeur_cible: Number(form.valeur_cible), owner_id: form.owner_id || null, internal_project_id: form.internal_project_id || null, description: form.description || null });
    setSaving(false);
    if (error) return alert(error.message);
    setShowForm(false); router.refresh();
  }

  const field = "w-full rounded-xl border border-zinc-800 bg-black p-3 text-sm text-white outline-none focus:border-zinc-600";
  return <div>
    <div className="flex justify-end"><button onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">{showForm ? "Fermer" : "+ Nouvel objectif"}</button></div>
    {showForm && <form onSubmit={createObjective} className="mt-5 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Field label="Objectif" wide><input required className={field} value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Ex. Structurer le pilotage LMG" /></Field><Field label="Pôle"><select className={field} value={form.pole} onChange={(e) => setForm({ ...form, pole: e.target.value })}>{INTERNAL_PROJECT_POLES.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Trimestre"><input required className={field} value={form.trimestre} onChange={(e) => setForm({ ...form, trimestre: e.target.value })} placeholder="2026-T4" /></Field></div>
      <Field label="Description"><textarea className={`${field} mt-4 min-h-24`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Résultat concret recherché et contexte…" /></Field>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5"><Field label="Indicateur"><input required className={field} value={form.indicateur} onChange={(e) => setForm({ ...form, indicateur: e.target.value })} placeholder="Ex. Procédures validées" /></Field><Field label="Valeur initiale"><input required type="number" step="any" className={field} value={form.valeur_initiale} onChange={(e) => setForm({ ...form, valeur_initiale: e.target.value })} /></Field><Field label="Valeur actuelle"><input required type="number" step="any" className={field} value={form.valeur_actuelle} onChange={(e) => setForm({ ...form, valeur_actuelle: e.target.value })} /></Field><Field label="Cible"><input required type="number" step="any" className={field} value={form.valeur_cible} onChange={(e) => setForm({ ...form, valeur_cible: e.target.value })} /></Field><Field label="Unité"><input required className={field} value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })} placeholder="%, €, contrats…" /></Field></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5"><Field label="Responsable"><select className={field} value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}><option value="">Non attribué</option>{profiles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field><Field label="Projet associé"><select className={field} value={form.internal_project_id} onChange={(e) => setForm({ ...form, internal_project_id: e.target.value })}><option value="">Aucun</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field><Field label="Échéance"><input required type="date" className={field} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field><Field label="Statut"><select className={field} value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>{["À lancer","En cours","Atteint","En pause","Abandonné"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Risque"><select className={field} value={form.niveau_risque} onChange={(e) => setForm({ ...form, niveau_risque: e.target.value })}>{["Maîtrisé","À surveiller","Critique"].map((item) => <option key={item}>{item}</option>)}</select></Field></div>
      <button disabled={saving} className="mt-5 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-bold text-black disabled:opacity-50">{saving ? "Création…" : "Créer l’objectif"}</button>
    </form>}

    {!objectives.length ? <div className="mt-8 rounded-[26px] border border-dashed border-zinc-800 p-12 text-center text-zinc-600">Aucun objectif pour ce trimestre.</div> : <div className="mt-8 grid gap-5 xl:grid-cols-2">{objectives.map((objective) => <ObjectiveCard key={objective.id} objective={objective} />)}</div>}
  </div>;
}

function ObjectiveCard({ objective }: { objective: Objective }) {
  const router = useRouter(); const [value, setValue] = useState(String(objective.valeur_actuelle)); const [comment, setComment] = useState(""); const [saving, setSaving] = useState(false);
  const span = objective.valeur_cible - objective.valeur_initiale;
  const progress = span ? Math.max(0, Math.min(100, Math.round(((Number(objective.valeur_actuelle) - Number(objective.valeur_initiale)) / span) * 100))) : 0;
  async function updateProgress() { setSaving(true); const numeric = Number(value); const { error: updateError } = await supabaseBrowser.from("company_objectives").update({ valeur_actuelle: numeric, updated_at: new Date().toISOString() }).eq("id", objective.id); if (!updateError) await supabaseBrowser.from("company_objective_updates").insert({ objective_id: objective.id, valeur: numeric, commentaire: comment || null }); setSaving(false); if (updateError) return alert(updateError.message); setComment(""); router.refresh(); }
  const riskStyle = objective.niveau_risque === "Critique" ? "bg-red-500/10 text-red-300" : objective.niveau_risque === "À surveiller" ? "bg-yellow-500/10 text-yellow-300" : "bg-green-500/10 text-green-300";
  return <article className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-6"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-500">{objective.pole}</span><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${riskStyle}`}>{objective.niveau_risque}</span><span className="ml-auto text-xs text-zinc-600">{objective.trimestre}</span></div><h2 className="mt-5 text-2xl font-bold">{objective.titre}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{objective.description || objective.indicateur}</p><div className="mt-6 flex items-end justify-between"><div><p className="text-xs text-zinc-600">{objective.indicateur}</p><p className="mt-1 text-3xl font-bold">{objective.valeur_actuelle} <span className="text-base text-zinc-500">/ {objective.valeur_cible} {objective.unite}</span></p></div><p className="text-2xl font-black text-yellow-500">{progress}%</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-yellow-500" style={{ width: `${progress}%` }} /></div><div className="mt-5 grid gap-2 sm:grid-cols-[120px_1fr_auto]"><input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} className="rounded-xl border border-zinc-800 bg-black p-3 text-sm outline-none" /><input value={comment} onChange={(e) => setComment(e.target.value)} className="rounded-xl border border-zinc-800 bg-black p-3 text-sm outline-none" placeholder="Commentaire de mise à jour…" /><button onClick={updateProgress} disabled={saving} className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold hover:bg-zinc-900">Mettre à jour</button></div><div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-zinc-900 pt-4 text-xs text-zinc-600"><span>{objective.owner?.nom || objective.owner?.full_name || "Non attribué"}</span>{objective.project?.id ? <Link href={`/projets-internes/${objective.project.id}`} className="hover:text-white">{objective.project.titre} →</Link> : <span>Échéance {formatDate(objective.deadline)}</span>}</div></article>;
}
function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) { return <label className={wide ? "xl:col-span-2" : ""}><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>{children}</label>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
