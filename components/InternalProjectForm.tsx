"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { categoriesForPole, INTERNAL_PROJECT_POLES } from "@/lib/internal-project-taxonomy";

type Profile = { id: string; nom: string | null; full_name?: string | null };
type Project = {
  id?: string; titre?: string | null; pole?: string | null; categorie?: string | null; statut?: string | null;
  priorite?: string | null; objectif?: string | null; contexte?: string | null;
  perimetre?: string | null; criteres_reussite?: string | null; risques?: string | null; progression?: number | null;
  consignes?: string | null; decisions?: string | null; ressources?: string | null;
  owner_id?: string | null; date_debut?: string | null; deadline?: string | null;
};

export default function InternalProjectForm({ profiles, project }: { profiles: Profile[]; project?: Project }) {
  const router = useRouter();
  const [form, setForm] = useState({
    titre: project?.titre || "", pole: project?.pole || "Direction", categorie: project?.categorie || "Organisation interne", statut: project?.statut || "À cadrer",
    priorite: project?.priorite || "Moyenne", objectif: project?.objectif || "", contexte: project?.contexte || "",
    perimetre: project?.perimetre || "", criteres_reussite: project?.criteres_reussite || "", risques: project?.risques || "", progression: String(project?.progression || 0),
    consignes: project?.consignes || "", decisions: project?.decisions || "", ressources: project?.ressources || "",
    owner_id: project?.owner_id || "", date_debut: project?.date_debut || "", deadline: project?.deadline || "",
  });
  const [saving, setSaving] = useState(false);

  function update(field: string, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    const payload = { ...form, owner_id: form.owner_id || null, date_debut: form.date_debut || null, deadline: form.deadline || null, updated_at: new Date().toISOString() };
    const result = project?.id
      ? await supabaseBrowser.from("internal_projects").update(payload).eq("id", project.id).select("id").single()
      : await supabaseBrowser.from("internal_projects").insert(payload).select("id").single();
    if (result.error || !result.data) { alert(result.error?.message || "Impossible d’enregistrer le projet."); setSaving(false); return; }
    router.push(`/projets-internes/${result.data.id}`); router.refresh();
  }

  const fieldClass = "w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none focus:border-zinc-600";
  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
      <div className="grid gap-5 xl:grid-cols-3">
        <label className="space-y-2 xl:col-span-1"><span className="text-sm text-zinc-400">Nom du projet *</span><input required value={form.titre} onChange={(e) => update("titre", e.target.value)} className={fieldClass} placeholder="Ex. Structuration & Pilotage LMG" /></label>
        <label className="space-y-2"><span className="text-sm text-zinc-400">Pôle *</span><select required value={form.pole} onChange={(e) => { const nextPole = e.target.value; setForm((current) => ({ ...current, pole: nextPole, categorie: categoriesForPole(nextPole)[0] || "" })); }} className={fieldClass}>{INTERNAL_PROJECT_POLES.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="space-y-2"><span className="text-sm text-zinc-400">Catégorie *</span><select required value={form.categorie} onChange={(e) => update("categorie", e.target.value)} className={fieldClass}>{!categoriesForPole(form.pole).includes(form.categorie as never) && form.categorie ? <option>{form.categorie}</option> : null}{categoriesForPole(form.pole).map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      <label className="block space-y-2"><span className="text-sm text-zinc-400">Objectif principal</span><textarea value={form.objectif} onChange={(e) => update("objectif", e.target.value)} className={`${fieldClass} min-h-28`} placeholder="Le résultat concret que ce projet doit produire." /></label>
      <label className="block space-y-2"><span className="text-sm text-zinc-400">Contexte et base de travail</span><textarea value={form.contexte} onChange={(e) => update("contexte", e.target.value)} className={`${fieldClass} min-h-40`} placeholder="Point de départ, historique, informations utiles..." /></label>
      <div className="grid gap-5 xl:grid-cols-2"><label className="space-y-2"><span className="text-sm text-zinc-400">Périmètre du projet</span><textarea value={form.perimetre} onChange={(e) => update("perimetre", e.target.value)} className={`${fieldClass} min-h-36`} placeholder="Ce qui est inclus, exclu et les limites du projet..." /></label><label className="space-y-2"><span className="text-sm text-zinc-400">Critères de réussite</span><textarea value={form.criteres_reussite} onChange={(e) => update("criteres_reussite", e.target.value)} className={`${fieldClass} min-h-36`} placeholder="Comment saurons-nous que le projet est réussi ?" /></label></div>
      <label className="block space-y-2"><span className="text-sm text-zinc-400">Consignes</span><textarea value={form.consignes} onChange={(e) => update("consignes", e.target.value)} className={`${fieldClass} min-h-40`} placeholder="Méthode, contraintes, livrables attendus, éléments à respecter..." /></label>
      <div className="grid gap-5 xl:grid-cols-3"><label className="space-y-2"><span className="text-sm text-zinc-400">Décisions initiales</span><textarea value={form.decisions} onChange={(e) => update("decisions", e.target.value)} className={`${fieldClass} min-h-36`} placeholder="Décisions prises et raisons..." /></label><label className="space-y-2"><span className="text-sm text-zinc-400">Risques et points de vigilance</span><textarea value={form.risques} onChange={(e) => update("risques", e.target.value)} className={`${fieldClass} min-h-36`} placeholder="Blocages possibles, dépendances, alertes..." /></label><label className="space-y-2"><span className="text-sm text-zinc-400">Ressources générales</span><textarea value={form.ressources} onChange={(e) => update("ressources", e.target.value)} className={`${fieldClass} min-h-36`} placeholder="Références, contacts et informations utiles..." /></label></div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <label className="space-y-2"><span className="text-sm text-zinc-400">Statut</span><select value={form.statut} onChange={(e) => update("statut", e.target.value)} className={fieldClass}>{["À cadrer","Planifié","En cours","En pause","Terminé","Archivé"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label className="space-y-2"><span className="text-sm text-zinc-400">Priorité</span><select value={form.priorite} onChange={(e) => update("priorite", e.target.value)} className={fieldClass}>{["Basse","Moyenne","Haute","Urgente"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label className="space-y-2"><span className="text-sm text-zinc-400">Responsable</span><select value={form.owner_id} onChange={(e) => update("owner_id", e.target.value)} className={fieldClass}><option value="">Non attribué</option>{profiles.map((p) => <option key={p.id} value={p.id}>{p.nom || p.full_name || "Membre LMG"}</option>)}</select></label>
        <label className="space-y-2"><span className="text-sm text-zinc-400">Début</span><input type="date" value={form.date_debut} onChange={(e) => update("date_debut", e.target.value)} className={fieldClass} /></label>
        <label className="space-y-2"><span className="text-sm text-zinc-400">Échéance</span><input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} className={fieldClass} /></label>
        <label className="space-y-2"><span className="text-sm text-zinc-400">Progression (%)</span><input type="number" min="0" max="100" value={form.progression} onChange={(e) => update("progression", e.target.value)} className={fieldClass} /></label>
      </div>
      <button disabled={saving} className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50">{saving ? "Enregistrement..." : project?.id ? "Enregistrer les modifications" : "Créer le projet interne"}</button>
    </form>
  );
}
