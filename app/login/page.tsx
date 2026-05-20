"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail.includes("@")) {
      alert("Email invalide.");
      return;
    }

    if (cleanPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    console.log("SIGNUP EMAIL:", cleanEmail);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
    });

    console.log("SIGNUP DATA:", data);
    console.log("SIGNUP ERROR:", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Compte créé !");
  }

  async function handleLogin() {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      alert("Ajoute ton email et ton mot de passe.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-10">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">LMG OS</h1>

        <div className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-xl bg-white text-black py-4 font-semibold hover:bg-zinc-200 transition"
          >
            Connexion
          </button>

          <button
            type="button"
            onClick={handleSignup}
            className="w-full rounded-xl border border-zinc-700 py-4 font-semibold hover:bg-zinc-800 transition"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </main>
  );
}