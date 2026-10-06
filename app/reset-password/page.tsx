"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState(""), [confirmation, setConfirmation] = useState(""), [loading, setLoading] = useState(false), [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (password !== confirmation) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) throw new Error("Lien invalide ou expiré. Demandez un nouveau lien.");
      const { error: updateError } = await supabaseBrowser.auth.updateUser({ password });
      if (updateError) throw new Error("Impossible de modifier le mot de passe. Réessayez ou demandez un nouveau lien.");
      await supabaseBrowser.auth.signOut(); router.replace("/login"); router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Réinitialisation indisponible."); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-zinc-800 p-8"><h1 className="text-3xl font-bold">Nouveau mot de passe</h1><label className="block">Mot de passe (10 caractères minimum)<input required minLength={10} maxLength={256} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-4" /></label><label className="block">Confirmer le mot de passe<input required minLength={10} type="password" autoComplete="new-password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-4" /></label>{error && <p role="alert" className="text-red-300">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-white p-4 font-semibold text-black disabled:opacity-50">{loading ? "Enregistrement…" : "Enregistrer mon mot de passe"}</button><Link href="/forgot-password" className="block underline">Demander un nouveau lien</Link></form></main>;
}
