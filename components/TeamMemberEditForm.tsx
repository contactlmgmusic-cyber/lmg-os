"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/roles";

type Artist = { id: string; nom: string };
type Member = { id: string; nom: string | null; role: string | null; artiste_id: string | null };

export default function TeamMemberEditForm({ member, artists, actorId, actorRole }: { member: Member; artists: Artist[]; actorId: string; actorRole: string }) {
  const router = useRouter();
  const [name, setName] = useState(member.nom || "");
  const [role, setRole] = useState(member.role || ROLES.PRESTATAIRE);
  const [artistId, setArtistId] = useState(member.artiste_id || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const canChangeRole = actorId !== member.id && (actorRole === ROLES.SUPER_ADMIN || member.role !== ROLES.SUPER_ADMIN);

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const response = await fetch(`/api/equipe/${member.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, role, artistId }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error || "Mise à jour impossible."); setSaving(false); return; }
    router.push("/equipe"); router.refresh();
  }

  return <form onSubmit={save} className="space-y-5 rounded-[26px] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
    <label className="block text-sm font-semibold text-zinc-400">Nom complet<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white" /></label>
    <label className="block text-sm font-semibold text-zinc-400">Rôle<select disabled={!canChangeRole} value={role} onChange={(e) => setRole(e.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white disabled:opacity-50"><option value={ROLES.ARTISTE}>Artiste</option><option value={ROLES.MANAGER}>Manager</option><option value={ROLES.ARTISTIC_DIRECTOR}>Directeur artistique</option><option value={ROLES.PRESTATAIRE}>Prestataire</option><option value={ROLES.ADMIN}>Admin</option>{actorRole === ROLES.SUPER_ADMIN && <option value={ROLES.SUPER_ADMIN}>Super Admin</option>}</select></label>
    {role === ROLES.ARTISTE && <label className="block text-sm font-semibold text-zinc-400">Artiste lié<select value={artistId} onChange={(e) => setArtistId(e.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"><option value="">Aucun artiste lié</option>{artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.nom}</option>)}</select></label>}
    {!canChangeRole && <p className="text-xs leading-5 text-zinc-500">Ce rôle est protégé. Ton propre niveau d’accès ne peut pas être modifié depuis cette fiche.</p>}
    {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    <div className="flex gap-3"><button disabled={saving} className="rounded-xl bg-white px-5 py-3 font-bold text-black disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer"}</button><button type="button" onClick={() => router.back()} className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300">Annuler</button></div>
  </form>;
}
