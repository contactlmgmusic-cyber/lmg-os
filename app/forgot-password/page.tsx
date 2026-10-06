"use client";
import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(""), [loading, setLoading] = useState(false), [message, setMessage] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/callback` });
      if (error) throw error;
      setMessage("Si un compte correspond à cet email, vous recevrez un lien de réinitialisation.");
    } catch { setMessage("L’envoi est temporairement indisponible. Réessayez plus tard."); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-zinc-800 p-8"><h1 className="text-3xl font-bold">Mot de passe oublié</h1><label className="block">Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-4" /></label>{message && <p role="status">{message}</p>}<button disabled={loading} className="w-full rounded-xl bg-white p-4 font-semibold text-black disabled:opacity-50">{loading ? "Envoi…" : "Recevoir un lien"}</button><Link href="/login" className="block underline">Retour à la connexion</Link></form></main>;
}
