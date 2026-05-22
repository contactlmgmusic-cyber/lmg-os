"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-10 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <h1 className="text-4xl font-bold">Connexion</h1>

        <p className="mt-2 text-zinc-400">
          Accès sécurisé LMG OS.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-8 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-4 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          required
        />

        <button className="mt-6 w-full rounded-xl bg-white px-5 py-4 font-semibold text-black">
          Se connecter
        </button>

        <a
          href="/signup"
          className="mt-5 block text-center text-sm text-zinc-400 hover:text-white"
        >
          Pas encore de compte ? Créer un compte
        </a>
      </form>
    </main>
  );
}