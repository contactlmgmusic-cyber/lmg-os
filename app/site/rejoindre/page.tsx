"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export default function RejoindrePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nom_artiste: "",
    ville: "",
    email: "",
    telephone: "",
    style_musical: "",
    stade_projet: "",
    equipe_actuelle: "",
    instagram: "",
    tiktok: "",
    spotify: "",
    lien_musique: "",
    objectifs: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);

    const { error } = await supabaseBrowser
      .from("candidatures")
      .insert({
        ...form,
        statut: "nouvelle",
        priorite: "moyenne",
        source: "site_web",
        potentiel: "À qualifier",
        assigned_to: null,
      });

    setLoading(false);

    if (error) {
      console.error("Erreur candidature :", error);
      alert(error.message);
      return;
    }

    setSuccess(true);

    setForm({
      nom_artiste: "",
      ville: "",
      email: "",
      telephone: "",
      style_musical: "",
      stade_projet: "",
      equipe_actuelle: "",
      instagram: "",
      tiktok: "",
      spotify: "",
      lien_musique: "",
      objectifs: "",
      message: "",
    });
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-900 px-6 pb-24 pt-36 md:px-8 md:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#3a2a00_0%,#090700_25%,#000_65%)]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Link
            href="/site"
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            ← Retour au site
          </Link>

          <p className="mt-16 text-sm uppercase tracking-[0.4em] text-yellow-500">
            Rejoindre LMG
          </p>

          <h1 className="mt-5 max-w-5xl text-6xl font-black uppercase leading-[0.95] md:text-8xl">
            Construis plus qu&apos;un projet.
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400 md:text-xl">
            Présente-nous ton univers, ta musique et ta vision. Chaque
            candidature est étudiée individuellement par l&apos;équipe de
            Legacy Music Group.
          </p>
        </div>
      </section>

      {/* CE QUE NOUS RECHERCHONS */}
      <section className="border-b border-zinc-900 px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[38%_62%]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Ce que nous recherchons
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase leading-tight md:text-6xl">
              Une vision capable de durer.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Une identité artistique claire",
              "Une vision long terme",
              "Une vraie régularité",
              "Une volonté de progresser",
              "Un projet structuré",
              "Un état d'esprit professionnel",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-zinc-900 bg-zinc-950 p-6 text-zinc-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-b border-zinc-900 bg-zinc-950 px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            Notre processus
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
            Comment rejoindre LMG ?
          </h2>

          <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-zinc-900 bg-zinc-900 md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Candidature",
                text: "Présente ton projet, ta musique, ton univers et tes ambitions.",
              },
              {
                number: "02",
                title: "Étude",
                text: "Notre équipe analyse ton identité, ton niveau de développement et ta vision.",
              },
              {
                number: "03",
                title: "Échange",
                text: "Si ton projet correspond à la direction de LMG, nous organisons un échange.",
              },
              {
                number: "04",
                title: "Collaboration",
                text: "Si nous décidons d'avancer ensemble, nous construisons une stratégie adaptée à ton projet.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="bg-black p-8 md:min-h-[300px]"
              >
                <p className="text-2xl font-black text-yellow-500">
                  {step.number}
                </p>

                <h3 className="mt-12 text-2xl font-black uppercase">
                  {step.title}
                </h3>

                <p className="mt-5 text-sm leading-7 text-zinc-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULAIRE */}
      <section className="px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Candidature
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
              Présente ton projet.
            </h2>

            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Donne-nous suffisamment de contexte pour comprendre qui tu es,
              où tu en es et ce que tu veux construire.
            </p>
          </div>

          {success ? (
            <div className="rounded-[2rem] border border-yellow-500/30 bg-zinc-950 p-10 md:p-14">
              <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
                Candidature reçue
              </p>

              <h3 className="mt-5 text-4xl font-black uppercase md:text-5xl">
                Merci pour ton projet.
              </h3>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
                Notre équipe va étudier ta candidature. Si ton univers
                correspond à la direction de Legacy Music Group, nous
                reviendrons vers toi pour poursuivre l&apos;échange.
              </p>

              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-10 rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold transition hover:border-yellow-500"
              >
                Envoyer une autre candidature
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-zinc-900 bg-zinc-950 p-6 md:p-10"
            >
              {/* IDENTITÉ */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
                  01 — Identité
                </p>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <input
                    required
                    placeholder="Nom d’artiste *"
                    value={form.nom_artiste}
                    onChange={(e) =>
                      setForm({ ...form, nom_artiste: e.target.value })
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                  />

                  <input
                    placeholder="Ville"
                    value={form.ville}
                    onChange={(e) =>
                      setForm({ ...form, ville: e.target.value })
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                  />

                  <input
                    required
                    type="email"
                    placeholder="Email *"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                  />

                  <input
                    placeholder="Téléphone"
                    value={form.telephone}
                    onChange={(e) =>
                      setForm({ ...form, telephone: e.target.value })
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* PROJET */}
              <div className="mt-12 border-t border-zinc-900 pt-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
                  02 — Projet
                </p>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <input
                    required
                    placeholder="Style musical *"
                    value={form.style_musical}
                    onChange={(e) =>
                      setForm({ ...form, style_musical: e.target.value })
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                  />

                  <select
                    required
                    value={form.stade_projet}
                    onChange={(e) =>
                      setForm({ ...form, stade_projet: e.target.value })
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none transition focus:border-yellow-500"
                  >
                    <option value="">Stade du projet *</option>
                    <option value="debut">Début de projet</option>
                    <option value="developpement">En développement</option>
                    <option value="actif">Projet actif</option>
                    <option value="structure">Projet déjà structuré</option>
                  </select>

                  <input
                    className="md:col-span-2 rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                    placeholder="Équipe actuelle : manager, beatmaker, DA, label..."
                    value={form.equipe_actuelle}
                    onChange={(e) =>
                      setForm({ ...form, equipe_actuelle: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* LIENS */}
              <div className="mt-12 border-t border-zinc-900 pt-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
                  03 — Présence & musique
                </p>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <input
                    placeholder="Instagram"
                    value={form.instagram}
                    onChange={(e) =>
                      setForm({ ...form, instagram: e.target.value })
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                  />

                  <input
                    placeholder="TikTok"
                    value={form.tiktok}
                    onChange={(e) =>
                      setForm({ ...form, tiktok: e.target.value })
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                  />

                  <input
                    placeholder="Spotify"
                    value={form.spotify}
                    onChange={(e) =>
                      setForm({ ...form, spotify: e.target.value })
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                  />

                  <input
                    required
                    placeholder="Lien musique / YouTube / SoundCloud / Drive *"
                    value={form.lien_musique}
                    onChange={(e) =>
                      setForm({ ...form, lien_musique: e.target.value })
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* VISION */}
              <div className="mt-12 border-t border-zinc-900 pt-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
                  04 — Vision
                </p>

                <textarea
                  required
                  rows={4}
                  placeholder="Quels sont tes objectifs pour les 12 prochains mois ? *"
                  value={form.objectifs}
                  onChange={(e) =>
                    setForm({ ...form, objectifs: e.target.value })
                  }
                  className="mt-6 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                />

                <textarea
                  required
                  rows={6}
                  placeholder="Présente ton projet, ton univers et ce qui te différencie. *"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="mt-5 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none transition focus:border-yellow-500"
                />
              </div>

              <div className="mt-10 flex flex-col gap-4 border-t border-zinc-900 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-xs leading-6 text-zinc-600">
                  Les informations envoyées sont utilisées uniquement pour
                  l&apos;étude de ta candidature par Legacy Music Group.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-50"
                >
                  {loading ? "Envoi..." : "Envoyer ma candidature"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}