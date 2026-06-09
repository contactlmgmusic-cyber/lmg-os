"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RejoindrePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nom_artiste: "",
    ville: "",
    email: "",
    telephone: "",
    instagram: "",
    tiktok: "",
    spotify: "",
    lien_musique: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const { error } = await supabaseBrowser.from("candidatures").insert({
  ...form,
  statut: "nouvelle",
  priorite: "moyenne",
  source: "site_web",
});

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSuccess(true);
    setForm({
      nom_artiste: "",
      ville: "",
      email: "",
      telephone: "",
      instagram: "",
      tiktok: "",
      spotify: "",
      lien_musique: "",
      message: "",
    });
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 py-28">
        <p className="mb-4 text-sm uppercase tracking-[0.4em] text-yellow-500">
          Rejoindre LMG
        </p>

        <h1 className="text-5xl font-black uppercase md:text-7xl">
          Deviens un artiste LMG
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
          Tu es artiste, DJ, beatmaker ou créateur musical ? Présente ton projet
          à Legacy Music Group. Nous recherchons des profils sérieux, ambitieux
          et prêts à construire sur le long terme.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-14 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <input
              required
              placeholder="Nom d’artiste"
              value={form.nom_artiste}
              onChange={(e) => setForm({ ...form, nom_artiste: e.target.value })}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none focus:border-yellow-500"
            />

            <input
              placeholder="Ville"
              value={form.ville}
              onChange={(e) => setForm({ ...form, ville: e.target.value })}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none focus:border-yellow-500"
            />

            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none focus:border-yellow-500"
            />

            <input
              placeholder="Téléphone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none focus:border-yellow-500"
            />

            <input
              placeholder="Instagram"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none focus:border-yellow-500"
            />

            <input
              placeholder="TikTok"
              value={form.tiktok}
              onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none focus:border-yellow-500"
            />

            <input
              placeholder="Spotify"
              value={form.spotify}
              onChange={(e) => setForm({ ...form, spotify: e.target.value })}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none focus:border-yellow-500"
            />

            <input
              required
              placeholder="Lien musique / YouTube / SoundCloud / Drive"
              value={form.lien_musique}
              onChange={(e) =>
                setForm({ ...form, lien_musique: e.target.value })
              }
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none focus:border-yellow-500"
            />
          </div>

          <textarea
            required
            rows={6}
            placeholder="Présente ton projet, ton univers, tes objectifs..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="mt-5 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none focus:border-yellow-500"
          />

          <button
            disabled={loading}
            className="mt-6 rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Envoyer ma candidature"}
          </button>

          {success && (
            <p className="mt-5 text-green-400">
              Candidature envoyée avec succès. LMG reviendra vers toi si ton
              profil correspond.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}