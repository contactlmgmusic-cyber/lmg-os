"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { getRoleHome, isUserRole } from "@/lib/roles";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [error, setError] = useState(""), [loading, setLoading] = useState(false);
  async function handleLogin(event: React.FormEvent) {
    event.preventDefault(); if (loading) return; setLoading(true); setError("");
    try {
      const { data, error: loginError } = await supabaseBrowser.auth.signInWithPassword({ email: email.trim(), password });
      if (loginError || !data.user) throw new Error("Email ou mot de passe incorrect.");
      const { data: profile, error: profileError } = await supabaseBrowser.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      if (profileError || !isUserRole(profile?.role)) { await supabaseBrowser.auth.signOut(); throw new Error("Votre accès n’est pas encore configuré. Contactez un administrateur."); }
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const destination = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : getRoleHome(profile.role);
      router.replace(destination); router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Connexion indisponible. Réessayez."); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-black px-5 py-10 text-white"><form onSubmit={handleLogin} className="w-full max-w-md space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"><h1 className="text-4xl font-bold">Connexion</h1><p className="text-zinc-400">Accès sécurisé LMG OS.</p><label className="block">Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-4" /></label><label className="block">Mot de passe<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-4" /></label>{error && <p role="alert" className="text-sm text-red-300">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-white px-5 py-4 font-semibold text-black disabled:opacity-50">{loading ? "Connexion…" : "Se connecter"}</button><Link href="/forgot-password" className="block text-sm text-zinc-300 underline">Mot de passe oublié ?</Link></form></main>;
}
