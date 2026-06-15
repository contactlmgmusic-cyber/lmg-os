"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

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
        <Link
  href="/site"
  className="text-sm text-zinc-400 hover:text-white"
>
  ← Retour au site
</Link>

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

        <section className="mb-24">
  <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
    Notre processus
  </p>

  <h2 className="text-4xl font-black md:text-6xl">
    Comment rejoindre LMG ?
  </h2>

  <div className="mt-14 grid gap-6 md:grid-cols-2">
    {[
      [
        "01",
        "Candidature",
        "Présente ton projet, ton univers et tes ambitions."
      ],
      [
        "02",
        "Étude",
        "Nous analysons ton identité artistique, ton potentiel et ta vision."
      ],
      [
        "03",
        "Échange",
        "Si ton profil correspond à LMG, nous prenons contact avec toi."
      ],
      [
        "04",
        "Développement",
        "Nous construisons ensemble une stratégie adaptée à ton projet."
      ],
    ].map(([number, title, text]) => (
      <div
        key={number}
        className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <p className="text-2xl font-black text-yellow-500">{number}</p>

        <h3 className="mt-4 text-xl font-bold">{title}</h3>

        <p className="mt-4 text-sm leading-6 text-zinc-400">
          {text}
        </p>
      </div>
    ))}
  </div>
</section>

<section className="mb-24 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
  <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
    Ce que nous recherchons
  </p>

  <h2 className="text-3xl font-black">
    Plus que du talent.
  </h2>

  <div className="mt-8 grid gap-6 md:grid-cols-2">
    {[
      "Une identité artistique claire",
      "Une vision long terme",
      "De la régularité dans le travail",
      "Une volonté de progresser",
      "Un projet sérieux",
      "Un état d'esprit professionnel",
    ].map((item) => (
      <div
        key={item}
        className="rounded-2xl border border-zinc-800 bg-black p-4"
      >
        {item}
      </div>
    ))}
  </div>
</section>

<div className="mb-10">
  <h2 className="text-3xl font-black">
    Présente ton projet
  </h2>

  <p className="mt-4 max-w-2xl text-zinc-400">
    Remplis le formulaire ci-dessous avec le plus d'informations
    possible. Chaque candidature est étudiée individuellement.
  </p>
</div>

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