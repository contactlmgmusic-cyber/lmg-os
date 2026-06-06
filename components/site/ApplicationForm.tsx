"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nom_artiste: "",
    email: "",
    instagram: "",
    lien_musique: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const { error } = await supabaseBrowser.from("candidatures").insert(form);

    setLoading(false);

    if (error) {
  console.error("Erreur candidature :", error);
  alert(error.message);
  return;
}

    setSuccess(true);
    setForm({
      nom_artiste: "",
      email: "",
      instagram: "",
      lien_musique: "",
      message: "",
    });
  }

  return (
    <section id="contact" className="bg-black px-6 py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
            Rejoindre LMG
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Tu veux construire ton héritage ?
          </h2>

          <p className="mt-6 max-w-xl text-zinc-400">
            Présente ton projet à Legacy Music Group. Nous étudions les profils
            avec une vraie vision artistique, une ambition forte et une envie de
            construire sur le long terme.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8"
        >
          <div className="grid gap-5">
            <input
              required
              placeholder="Nom d’artiste"
              value={form.nom_artiste}
              onChange={(e) =>
                setForm({ ...form, nom_artiste: e.target.value })
              }
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
            />

            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
            />

            <input
              placeholder="Instagram"
              value={form.instagram}
              onChange={(e) =>
                setForm({ ...form, instagram: e.target.value })
              }
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
            />

            <input
              placeholder="Lien musique / YouTube / Spotify / SoundCloud"
              value={form.lien_musique}
              onChange={(e) =>
                setForm({ ...form, lien_musique: e.target.value })
              }
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
            />

            <textarea
              placeholder="Présente ton projet"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
            />

            <button
              disabled={loading}
              className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Envoyer ma candidature"}
            </button>

            {success && (
              <p className="text-sm text-green-400">
                Candidature envoyée avec succès.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}