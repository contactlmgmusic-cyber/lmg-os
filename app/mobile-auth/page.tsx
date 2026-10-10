"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabase-browser";
import { isUserRole } from "@/lib/roles";

const MOBILE_ROLES = new Set([
  "super_admin",
  "admin",
  "manager",
  "artistic_director",
]);

export default function MobileAuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const { data: { user } } = await supabaseBrowser.auth.getUser();

      if (!active) return;
      if (user) {
        router.replace("/mobile");
        router.refresh();
        return;
      }

      setChecking(false);
    }

    void restoreSession();
    return () => { active = false; };
  }, [router]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabaseBrowser.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError || !data.user) {
      setError("E-mail ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabaseBrowser
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !isUserRole(profile?.role) || !MOBILE_ROLES.has(profile.role)) {
      await supabaseBrowser.auth.signOut();
      setError("Ce compte ne dispose pas d’un accès à LMG ADMIN.");
      setLoading(false);
      return;
    }

    router.replace("/mobile");
    router.refresh();
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-black px-5 py-[max(32px,env(safe-area-inset-top))] text-white">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-[#f2b705]/30 bg-[#f2b705]/10 text-xl font-black tracking-[-0.08em] text-[#f2b705]">
            LMG
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.34em] text-[#f2b705]">
            Legacy Music Group
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">LMG ADMIN</h1>
          <p className="mt-2 text-sm text-zinc-500">L’écosystème LMG dans votre poche.</p>
        </div>

        {checking ? (
          <div className="py-16 text-center text-sm text-zinc-600">Vérification de votre session…</div>
        ) : (
          <form onSubmit={login} className="space-y-4 rounded-[28px] border border-white/[0.08] bg-[#0b0b0b] p-5 shadow-2xl shadow-black">
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              E-mail
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-base font-medium normal-case tracking-normal text-white outline-none focus:border-[#f2b705]/60"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Mot de passe
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-base font-medium normal-case tracking-normal text-white outline-none focus:border-[#f2b705]/60"
              />
            </label>

            {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-[#f2b705] px-5 py-4 font-black text-black transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="w-full py-2 text-sm font-semibold text-zinc-500"
            >
              Mot de passe oublié ?
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
