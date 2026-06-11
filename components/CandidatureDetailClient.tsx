"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function CandidatureDetailClient({ id }: { id: string }) {
  const [candidature, setCandidature] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabaseBrowser
        .from("candidatures")
        .select("*")
        .eq("id", id)
        .single();

      console.log("CLIENT CANDIDATURE ID =", id);
      console.log("CLIENT CANDIDATURE DATA =", data);
      console.log("CLIENT CANDIDATURE ERROR =", error);

      setCandidature(data);
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  if (!candidature) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">Candidature introuvable.</p>
      </main>
    );
  }

  return (
  <main className="min-h-screen bg-red-600 p-10 text-white">
    <h1>TEST CANDIDATURE DETAIL CLIENT</h1>
  </main>
);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link
        href="/dashboard/candidatures"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour aux candidatures
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
            {candidature.statut || "Nouvelle"}
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            {candidature.nom_artiste || "Artiste non renseigné"}
          </h1>

          <p className="mt-3 text-zinc-400">
            {candidature.email || "Email non renseigné"}
          </p>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Message artiste</h2>
            <p className="mt-4 leading-relaxed text-zinc-300">
              {candidature.message || "Aucun message renseigné."}
            </p>
          </div>
        </section>

        <aside className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-3xl font-bold">Actions</h2>

          {candidature.lien_musique && (
            <a
              href={candidature.lien_musique}
              target="_blank"
              className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black"
            >
              Écouter la musique
            </a>
          )}

          <Link
            href={`/dashboard/candidatures/${candidature.id}/convertir`}
            className="block rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-4 text-center text-green-300"
          >
            Convertir en artiste
          </Link>
        </aside>
      </div>
    </main>
  );
}