"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { notifyRoles } from "@/lib/notify";

export default function RoyaltyGenerator({ splits, generatedSplitIds, loadError }: { splits: any[]; generatedSplitIds: string[]; loadError: string }) {
  const router = useRouter();
  const [splitId, setSplitId] = useState("");
  const [revenu, setRevenu] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const selected = useMemo(() => splits.find((split) => split.id === splitId), [splits, splitId]);
  const participants = selected?.split_participants || [];
  const totalPercentage = participants.reduce((sum: number, item: any) => sum + Number(item.pourcentage || 0), 0);
  const revenue = Number(revenu || 0);
  const alreadyGenerated = Boolean(splitId && generatedSplitIds.includes(splitId));
  const missingEmails = participants.filter((item: any) => !item.email).length;
  const validSplit = participants.length > 0 && Math.abs(totalPercentage - 100) < 0.001;
  const linkedProject = Boolean(selected?.projet_id);
  const canGenerate = Boolean(selected && revenue > 0 && validSplit && linkedProject && missingEmails === 0 && !alreadyGenerated);

  async function generate() {
    if (!canGenerate || loading) return;
    if (!window.confirm(`Générer ${participants.length} ligne(s) de royalties pour ${euros(revenue)} ? Cette répartition ne pourra pas être générée une seconde fois pour ce split.`)) return;
    setLoading(true); setMessage("");
    const { data: duplicate } = await supabaseBrowser.from("royalties").select("id").eq("split_id", selected.id).limit(1);
    if (duplicate?.length) { setMessage("Des royalties existent déjà pour ce split sheet."); setLoading(false); return; }
    const rows = participants.map((item: any) => ({
      projet_id: selected.projet_id, split_id: selected.id, participant_id: item.id,
      nom: item.nom, role: item.role, email: item.email, revenu_total: revenue,
      pourcentage: Number(item.pourcentage || 0), montant_du: (revenue * Number(item.pourcentage || 0)) / 100, statut: "À payer",
    }));
    const { error } = await supabaseBrowser.from("royalties").insert(rows);
    if (error) { setMessage(error.message); setLoading(false); return; }
    await supabaseBrowser.from("activity_logs").insert({ type: "Royalties", titre: "Royalties générées", description: `${selected.titre} • ${euros(revenue)} • ${participants.length} bénéficiaire(s)` });
    await notifyRoles({ roles: ["super_admin", "admin"], type: "Royalties", titre: "Royalties générées", description: `${selected.titre} • ${euros(revenue)}`, link: "/royalties" });
    router.push("/royalties"); router.refresh();
  }

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <Link href="/royalties" className="text-sm font-semibold text-zinc-500 hover:text-white">← Retour aux royalties</Link>
    <header className="mt-6 border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Finance LMG</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Générer des royalties</h1><p className="mt-3 max-w-3xl text-zinc-500">Transforme un revenu de master en montants dus, selon un split sheet validé à 100%.</p></header>
    {loadError ? <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5 text-red-300">Impossible de charger les split sheets.</div> :
    <section className="mt-8 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Étape 1</p><h2 className="mt-2 text-2xl font-bold">Source de la répartition</h2>
          <label className="mt-5 block"><span className="mb-2 block text-xs font-semibold text-zinc-500">Split sheet</span><select value={splitId} onChange={(e) => { setSplitId(e.target.value); setMessage(""); }} className="field"><option value="">Choisir un split sheet</option>{splits.map((split) => <option key={split.id} value={split.id}>{split.titre} — {projectTitle(split)}{generatedSplitIds.includes(split.id) ? " — déjà généré" : ""}</option>)}</select></label>
          <label className="mt-4 block"><span className="mb-2 block text-xs font-semibold text-zinc-500">Revenu net à répartir</span><div className="relative"><input type="number" min="0" step="0.01" value={revenu} onChange={(e) => { setRevenu(e.target.value); setMessage(""); }} placeholder="0,00" className="field pr-12" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">€</span></div></label>
        </section>
        <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Étape 2</p><h2 className="mt-2 text-2xl font-bold">Contrôles</h2><div className="mt-5 space-y-3">
          <Check ok={Boolean(selected)} label="Split sheet sélectionné" /><Check ok={linkedProject} label={linkedProject ? "Projet source rattaché" : "Projet source obligatoire"} /><Check ok={participants.length > 0} label={participants.length ? `${participants.length} participant(s)` : "Participants renseignés"} /><Check ok={validSplit} label={`Total du split : ${totalPercentage}%`} /><Check ok={missingEmails === 0} label={missingEmails ? `${missingEmails} e-mail(s) bénéficiaire(s) manquant(s)` : "Tous les bénéficiaires ont un e-mail"} /><Check ok={!alreadyGenerated} label={alreadyGenerated ? "Royalties déjà générées" : "Aucune génération existante"} /><Check ok={revenue > 0} label={revenue > 0 ? `Revenu : ${euros(revenue)}` : "Revenu valide renseigné"} />
          {missingEmails > 0 && <p className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-xs text-red-300">La génération est bloquée : complète les e-mails dans le split sheet pour garantir l’accès et la traçabilité de chaque bénéficiaire.</p>}
        </div></section>
      </div>
      <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><div className="flex flex-col gap-4 border-b border-zinc-900 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Aperçu avant génération</p><h2 className="mt-2 text-2xl font-bold">{selected?.titre || "Aucun split sélectionné"}</h2><p className="mt-2 text-sm text-zinc-500">{projectTitle(selected)}</p></div><div className="text-left sm:text-right"><p className="text-xs text-zinc-600">Total distribué</p><p className="mt-1 text-2xl font-bold">{euros(validSplit ? revenue : (revenue * totalPercentage) / 100)}</p></div></div>
        {!participants.length ? <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-600">Sélectionne un split sheet pour prévisualiser la répartition.</div> : <div>{participants.map((item: any) => <div key={item.id} className="grid gap-3 border-b border-zinc-900 py-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-semibold">{item.nom || "Participant"}</p><p className="mt-1 text-xs text-zinc-600">{item.role || "Rôle non renseigné"} · {item.email || "Email manquant"}</p></div><div className="text-left sm:text-right"><p className="text-xl font-bold">{euros((revenue * Number(item.pourcentage || 0)) / 100)}</p><p className="mt-1 text-xs text-zinc-600">{Number(item.pourcentage || 0)}%</p></div></div>)}</div>}
        {message && <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-sm text-red-300">{message}</p>}
        <button onClick={generate} disabled={!canGenerate || loading} className="mt-6 w-full rounded-xl bg-white px-5 py-4 text-sm font-bold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30">{loading ? "Génération…" : canGenerate ? `Générer ${participants.length} royalty(s)` : "Corrige les contrôles avant de générer"}</button>
      </section>
    </section>}
    <style jsx>{`.field{width:100%;min-height:3rem;border:1px solid rgb(39 39 42);border-radius:.75rem;background:#000;padding:.75rem 1rem;color:#fff;outline:none}.field:focus{border-color:rgb(82 82 91)}`}</style>
  </div></main>;
}

function Check({ ok, label }: { ok: boolean; label: string }) { return <div className="flex items-center gap-3 rounded-xl border border-zinc-900 bg-black p-3"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${ok ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"}`}>{ok ? "✓" : "!"}</span><p className="text-sm text-zinc-400">{label}</p></div>; }
function projectTitle(split?: any) { const project = Array.isArray(split?.projets) ? split.projets[0] : split?.projets; return project?.titre || "Projet non lié"; }
function euros(amount: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount || 0); }
