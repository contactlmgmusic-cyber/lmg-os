"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ObjectifsArtistePage() {
  const params = useParams();
  const router = useRouter();
  const artisteId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [artiste, setArtiste] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);
  const [objectifs, setObjectifs] = useState<any[]>([]);

  const [titre, setTitre] = useState("");
  const [objectif, setObjectif] = useState("");
  const [actuel, setActuel] = useState("");
  const [unite, setUnite] = useState("");
  const [statut, setStatut] = useState("En cours");
  const [projetId, setProjetId] = useState("");

  async function loadData() {
    const { data: artisteData } = await supabaseBrowser
      .from("artistes")
      .select("id, nom")
      .eq("id", artisteId)
      .single();

    const { data: projetsData } = await supabaseBrowser
      .from("projets")
      .select("id, titre")
      .eq("artiste_id", artisteId)
      .order("created_at", { ascending: false });

    const { data: objectifsData } = await supabaseBrowser
      .from("objectifs_artiste")
      .select(`
        *,
        projets (
          id,
          titre
        )
      `)
      .eq("artiste_id", artisteId)
      .order("created_at", { ascending: false });

    setArtiste(artisteData);
    setProjets(projetsData || []);
    setObjectifs(objectifsData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (artisteId) {
      loadData();
    }
  }, [artisteId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    if (!titre.trim()) {
      alert("Le titre est obligatoire.");
      return;
    }

    setSaving(true);

    const { error } = await supabaseBrowser.from("objectifs_artiste").insert({
      artiste_id: artisteId,
      projet_id: projetId || null,
      titre,
      objectif: objectif ? Number(objectif) : 0,
      actuel: actuel ? Number(actuel) : 0,
      unite,
      statut,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitre("");
    setObjectif("");
    setActuel("");
    setUnite("");
    setStatut("En cours");
    setProjetId("");

    await loadData();
    router.refresh();
  }

  async function updateObjectif(id: string, field: string, value: any) {
    const { error } = await supabaseBrowser
      .from("objectifs_artiste")
      .update({
        [field]: value,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
    router.refresh();
  }

  async function deleteObjectif(id: string) {
    if (!confirm("Supprimer cet objectif ?")) return;

    const { error } = await supabaseBrowser
      .from("objectifs_artiste")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <Link
          href={`/artistes/${artisteId}`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Retour artiste
        </Link>

        <h1 className="mt-6 text-5xl font-bold">Objectifs artiste</h1>

        <p className="mt-3 text-zinc-400">
          {artiste?.nom || "Artiste"} — gestion des objectifs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <form
          onSubmit={handleAdd}
          className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
        >
          <h2 className="mb-6 text-3xl font-bold">Ajouter un objectif</h2>

          <div className="space-y-4">
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex : 100 000 streams"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="number"
                value={actuel}
                onChange={(e) => setActuel(e.target.value)}
                placeholder="Actuel"
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
              />

              <input
                type="number"
                value={objectif}
                onChange={(e) => setObjectif(e.target.value)}
                placeholder="Objectif"
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
              />
            </div>

            <input
              value={unite}
              onChange={(e) => setUnite(e.target.value)}
              placeholder="Unité : streams, médias, contenus..."
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
            />

            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
            >
              <option>En cours</option>
              <option>Atteint</option>
              <option>En pause</option>
              <option>Abandonné</option>
            </select>

            <select
              value={projetId}
              onChange={(e) => setProjetId(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
            >
              <option value="">Aucun projet lié</option>

              {projets.map((projet) => (
                <option key={projet.id} value={projet.id}>
                  {projet.titre}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? "Ajout..." : "Ajouter l'objectif"}
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Objectifs actuels</h2>

          {objectifs.length === 0 && (
            <p className="text-zinc-500">Aucun objectif renseigné.</p>
          )}

          <div className="space-y-4">
            {objectifs.map((item) => {
              const target = Number(item.objectif || 0);
              const current = Number(item.actuel || 0);
              const percent =
                target > 0
                  ? Math.min(Math.round((current / target) * 100), 100)
                  : 0;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">{item.titre}</h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        {current} / {target} {item.unite || ""}
                      </p>

                      {item.projets?.titre && (
                        <p className="mt-1 text-xs text-zinc-600">
                          Projet : {item.projets.titre}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteObjectif(item.id)}
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900">
                    <div
                      className="h-full rounded-full bg-green-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-zinc-500">
                    Progression : {percent}%
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input
                      type="number"
                      defaultValue={item.actuel || 0}
                      onBlur={(e) =>
                        updateObjectif(
                          item.id,
                          "actuel",
                          Number(e.target.value)
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-white"
                    />

                    <input
                      type="number"
                      defaultValue={item.objectif || 0}
                      onBlur={(e) =>
                        updateObjectif(
                          item.id,
                          "objectif",
                          Number(e.target.value)
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-white"
                    />

                    <select
                      defaultValue={item.statut || "En cours"}
                      onChange={(e) =>
                        updateObjectif(item.id, "statut", e.target.value)
                      }
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-white"
                    >
                      <option>En cours</option>
                      <option>Atteint</option>
                      <option>En pause</option>
                      <option>Abandonné</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}