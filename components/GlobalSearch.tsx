"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Result = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: string;
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);

  async function search(value: string) {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    const [artistesRes, projetsRes, tachesRes, assetsRes] = await Promise.all([
      supabaseBrowser.from("artistes").select("id, nom, style").ilike("nom", `%${value}%`).limit(5),
      supabaseBrowser.from("projets").select("id, titre, type").ilike("titre", `%${value}%`).limit(5),
      supabaseBrowser.from("taches").select("id, titre, statut").ilike("titre", `%${value}%`).limit(5),
      supabaseBrowser.from("assets").select("id, nom, type, url").ilike("nom", `%${value}%`).limit(5),
    ]);

    const nextResults: Result[] = [
      ...(artistesRes.data || []).map((item) => ({
        id: item.id,
        title: item.nom,
        subtitle: item.style || "Artiste",
        href: `/artistes/${item.id}`,
        type: "Artiste",
      })),
      ...(projetsRes.data || []).map((item) => ({
        id: item.id,
        title: item.titre,
        subtitle: item.type || "Projet",
        href: `/projets/${item.id}`,
        type: "Projet",
      })),
      ...(tachesRes.data || []).map((item) => ({
        id: item.id,
        title: item.titre,
        subtitle: item.statut || "Tâche",
        href: `/taches/${item.id}`,
        type: "Tâche",
      })),
      ...(assetsRes.data || []).map((item) => ({
        id: item.id,
        title: item.nom,
        subtitle: item.type || "Asset",
        href: item.url,
        type: "Asset",
      })),
    ];

    setResults(nextResults);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-sm text-zinc-400 hover:border-zinc-600"
      >
        Rechercher artistes, projets, tâches, assets...
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/70 p-6 backdrop-blur-sm">
          <div className="mx-auto mt-20 max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <input
                autoFocus
                value={query}
                onChange={(e) => search(e.target.value)}
                placeholder="Recherche globale..."
                className="flex-1 rounded-2xl border border-zinc-800 bg-black p-4 text-white outline-none"
              />

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-zinc-700 px-5 py-4 text-zinc-300 hover:bg-zinc-800"
              >
                Fermer
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {query.length >= 2 && results.length === 0 && (
                <p className="text-zinc-500">Aucun résultat.</p>
              )}

              {results.map((result) => (
                <a
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  target={result.type === "Asset" ? "_blank" : undefined}
                  className="block rounded-2xl border border-zinc-800 bg-black p-4 hover:border-zinc-600"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{result.title}</p>
                      <p className="mt-1 text-sm text-zinc-500">{result.subtitle}</p>
                    </div>

                    <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                      {result.type}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}