"use client";

import { useCallback, useEffect, useState } from "react";
import { ROLES } from "@/lib/roles";

type Invitation = { id: string; email: string; role: string; status: string; created_at: string };

export default function InvitationsPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(ROLES.ARTISTE);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/invitations", { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setPageError(result.error || "Invitations indisponibles."); return; }
    setInvitations(result.invitations || []);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function create(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setPageError(""); setGeneratedLink("");
    const response = await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setPageError(result.error || "Création impossible."); setLoading(false); return; }
    setGeneratedLink(`${window.location.origin}/signup?invitation=${result.token}`);
    setEmail(""); await load(); setLoading(false);
  }

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">LMG Access</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Invitations</h1><p className="mt-3 text-zinc-400">Crée un accès unique, puis transmets-le toi-même depuis Gmail.</p></header>
    <div className="mt-8 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <form onSubmit={create} className="space-y-5 rounded-[26px] border border-zinc-800 bg-zinc-950 p-6"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nouvel accès</p><h2 className="mt-2 text-2xl font-bold">Inviter un membre</h2></div>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail professionnel" className="w-full rounded-2xl border border-zinc-800 bg-black p-4" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-2xl border border-zinc-800 bg-black p-4"><option value={ROLES.ADMIN}>Admin</option><option value={ROLES.MANAGER}>Manager</option><option value={ROLES.ARTISTE}>Artiste</option><option value={ROLES.PRESTATAIRE}>Prestataire</option></select>
        <button disabled={loading} className="w-full rounded-2xl bg-white px-5 py-4 font-bold text-black disabled:opacity-50">{loading ? "Création…" : "Générer le lien sécurisé"}</button>
        <p className="text-xs leading-5 text-zinc-500">Le lien expire après 7 jours et ne fonctionne qu’une fois. Aucun e-mail n’est envoyé par LMG OS.</p>
        {generatedLink && <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.06] p-4"><p className="text-sm font-bold text-green-300">Lien prêt</p><p className="mt-2 break-all text-xs text-zinc-400">{generatedLink}</p><button type="button" onClick={() => navigator.clipboard.writeText(generatedLink)} className="mt-4 rounded-xl border border-green-500/30 px-4 py-2 text-sm font-bold text-green-200">Copier pour Gmail</button></div>}
        {pageError && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{pageError}</p>}
      </form>
      <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-6"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Suivi</p><h2 className="mt-2 text-2xl font-bold">Accès générés</h2></div><span className="text-sm text-zinc-600">{invitations.length}</span></div>
        <div className="mt-6 space-y-3">{!invitations.length && <p className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-600">Aucune invitation.</p>}{invitations.map((item) => <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-black p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{item.email}</p><p className="mt-1 text-xs text-zinc-500">{item.role} · créée le {new Date(item.created_at).toLocaleDateString("fr-FR")}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${item.status === "accepted" ? "bg-green-500/10 text-green-300" : item.status === "expired" ? "bg-red-500/10 text-red-300" : "bg-yellow-500/10 text-yellow-300"}`}>{item.status === "accepted" ? "Acceptée" : item.status === "expired" ? "Expirée" : "En attente"}</span></article>)}</div>
      </section>
    </div>
  </div></main>;
}
