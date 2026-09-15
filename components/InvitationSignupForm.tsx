"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvitationSignupForm({ token }: { token: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/invitations/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, name, password }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error || "Création du compte impossible."); setLoading(false); return; }
    router.replace("/login?compte=cree");
  }

  return <form onSubmit={submit} className="mt-8 space-y-4">
    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom complet" className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white" />
    <input required minLength={10} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe (10 caractères minimum)" className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white" />
    {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    <button disabled={loading} className="w-full rounded-2xl bg-white px-5 py-4 font-bold text-black disabled:opacity-50">{loading ? "Création…" : "Créer mon accès LMG OS"}</button>
  </form>;
}

