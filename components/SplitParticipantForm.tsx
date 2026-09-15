"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SplitParticipantForm({ splitId, splitTitle, currentTotal, participantCount }: { splitId: string; splitTitle: string; currentTotal: number; participantCount: number }) {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [role, setRole] = useState("Auteur");
  const [pourcentage, setPourcentage] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const percentage = Number(pourcentage || 0);
  const newTotal = currentTotal + percentage;
  const available = Math.max(0, 100 - currentTotal);
  const valid = nom.trim().length > 1 && percentage > 0 && percentage <= available && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true); setMessage("");
    const [{ data: participants, error: totalError }, { data: royalties }] = await Promise.all([
      supabaseBrowser.from("split_participants").select("pourcentage").eq("split_id", splitId),
      supabaseBrowser.from("royalties").select("id").eq("split_id", splitId).limit(1),
    ]);
    if (totalError) { setMessage(totalError.message); setSaving(false); return; }
    if (royalties?.length) { setMessage("Ce split est verrouillé car des royalties ont déjà été générées."); setSaving(false); return; }
    const liveTotal = (participants || []).reduce((sum: number, item: any) => sum + Number(item.pourcentage || 0), 0);
    if (liveTotal + percentage > 100.001) { setMessage(`La répartition a été modifiée. Cette part porterait maintenant le total à ${liveTotal + percentage} %.`); setSaving(false); return; }
    const { error } = await supabaseBrowser.from("split_participants").insert({ split_id: splitId, nom: nom.trim(), role, pourcentage: percentage, email: email.trim().toLowerCase() });
    if (error) { setMessage(error.message); setSaving(false); return; }
    router.push(`/splits/${splitId}`); router.refresh();
  }

  return <section className="mt-8 grid gap-6 lg:grid-cols-[0.65fr_1.35fr]">
    <aside className="space-y-4"><Metric label="Total actuel" value={`${currentTotal}%`} detail={`${participantCount} participant(s)`} /><Metric label="Part disponible" value={`${available}%`} detail="Maximum encore attribuable" tone="good" /><div className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Objectif</p><p className="mt-2 text-sm leading-6 text-zinc-500">Le total du split doit atteindre exactement 100 %. L’email est obligatoire pour relier ensuite les royalties au bon bénéficiaire.</p></div></aside>
    <form onSubmit={submit} className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Nouveau bénéficiaire</p><h2 className="mt-2 text-2xl font-bold">Identité et droits</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Nom complet"><input value={nom} onChange={(e) => { setNom(e.target.value); setMessage(""); }} placeholder="Nom du participant" className="field" /></Field><Field label="Rôle"><select value={role} onChange={(e) => setRole(e.target.value)} className="field"><option>Auteur</option><option>Compositeur</option><option>Producteur</option><option>Beatmaker</option><option>Interprète</option></select></Field><Field label="Email du bénéficiaire"><input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setMessage(""); }} placeholder="nom@exemple.com" className="field" /></Field><Field label="Pourcentage attribué"><div className="relative"><input type="number" min="0.01" max={available} step="0.01" value={pourcentage} onChange={(e) => { setPourcentage(e.target.value); setMessage(""); }} placeholder="0" className="field pr-12" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">%</span></div></Field></div>
      <div className={`mt-6 rounded-2xl border p-5 ${newTotal > 100 ? "border-red-500/20 bg-red-500/[0.05]" : newTotal === 100 ? "border-green-500/20 bg-green-500/[0.05]" : "border-zinc-800 bg-black"}`}><div className="flex items-end justify-between gap-4"><div><p className="text-xs text-zinc-600">Nouveau total</p><p className={`mt-1 text-3xl font-bold ${newTotal > 100 ? "text-red-400" : newTotal === 100 ? "text-green-400" : ""}`}>{newTotal}%</p></div><p className="text-right text-xs text-zinc-500">{newTotal > 100 ? `Dépassement de ${newTotal - 100}%` : newTotal === 100 ? "Split complet après ajout" : `${100 - newTotal}% resteront à attribuer`}</p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900"><div className={`h-full rounded-full ${newTotal > 100 ? "bg-red-400" : newTotal === 100 ? "bg-green-400" : "bg-yellow-400"}`} style={{ width: `${Math.min(newTotal, 100)}%` }} /></div></div>
      {message && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-sm text-red-300">{message}</p>}
      <button type="submit" disabled={!valid || saving} className="mt-6 w-full rounded-xl bg-white px-5 py-4 text-sm font-bold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30">{saving ? "Enregistrement…" : valid ? `Ajouter ${nom.trim()} à ${splitTitle}` : "Complète les informations requises"}</button>
      <style jsx>{`.field{width:100%;min-height:3rem;border:1px solid rgb(39 39 42);border-radius:.75rem;background:#000;padding:.75rem 1rem;color:#fff;outline:none}.field:focus{border-color:rgb(82 82 91)}`}</style>
    </form>
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-semibold text-zinc-500">{label}</span>{children}</label>; }
function Metric({ label, value, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: "default" | "good" }) { return <div className={`rounded-[26px] border p-5 ${tone === "good" ? "border-green-500/20 bg-green-500/[0.05]" : "border-zinc-800 bg-zinc-950"}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>; }
