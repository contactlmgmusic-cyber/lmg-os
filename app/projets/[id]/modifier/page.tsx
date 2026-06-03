"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase-browser";

export default function ModifierProjetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("");
  const [statut, setStatut] = useState("");
  const [dateSortie, setDateSortie] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [budgetClip, setBudgetClip] = useState(0);
const [budgetCover, setBudgetCover] = useState(0);
const [budgetPromo, setBudgetPromo] = useState(0);
const [budgetStudio, setBudgetStudio] = useState(0);
const [budgetInfluence, setBudgetInfluence] = useState(0);
const [budgetRp, setBudgetRp] = useState(0);

  useEffect(() => {
    async function fetchProjet() {
      const { data, error } = await supabaseBrowser
        .from("projets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setTitre(data.titre || "");
      setType(data.type || "");
      setStatut(data.statut || "");
      setDateSortie(data.date_sortie || "");
      setCoverUrl(data.cover_url || "");
      setNotes(data.notes || "");
      setBudgetClip(Number(data.budget_clip || 0));
setBudgetCover(Number(data.budget_cover || 0));
setBudgetPromo(Number(data.budget_promo || 0));
setBudgetStudio(Number(data.budget_studio || 0));
setBudgetInfluence(Number(data.budget_influence || 0));
setBudgetRp(Number(data.budget_rp || 0));
      setLoading(false);
    }

    fetchProjet();
  }, [id]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const filePath = `covers/${id}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from("lmg-assets")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabaseBrowser.storage
      .from("lmg-assets")
      .getPublicUrl(filePath);

    setCoverUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser
      .from("projets")
      .update({
        titre,
        type,
        statut,
        date_sortie: dateSortie || null,
        cover_url: coverUrl || null,
        notes,

        budget_clip: budgetClip,
budget_cover: budgetCover,
budget_promo: budgetPromo,
budget_studio: budgetStudio,
budget_influence: budgetInfluence,
budget_rp: budgetRp,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/projets/${id}`);
    router.refresh();
  }

  async function handleDelete() {
  if (!confirm("Tu es sûre de vouloir supprimer ce projet ?")) return;

  const { error } = await supabaseBrowser
    .from("projets")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  router.push("/projets");
  router.refresh();
}

  if (loading) {
    return <main className="p-10 text-white">Chargement...</main>;
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Modifier projet</h1>

        <p className="mt-3 text-zinc-400">
          Mets à jour les informations du projet.
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="max-w-3xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        {coverUrl && (
          <img
            src={coverUrl}
            alt="Cover projet"
            className="h-72 w-full rounded-3xl object-cover"
          />
        )}

        <label className="block cursor-pointer rounded-2xl border border-dashed border-zinc-700 bg-black p-6 text-center text-zinc-400 hover:border-white hover:text-white">
          {uploading ? "Upload de la cover..." : "Uploader une cover"}

          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
        </label>

        <input
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="URL cover"
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre du projet"
          required
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Type : Single, EP, Album..."
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Statut</option>
          <option value="Préparation">Préparation</option>
          <option value="Rollout">Rollout</option>
          <option value="Sorti">Sorti</option>
          <option value="Archivé">Archivé</option>
        </select>

        <input
          type="date"
          value={dateSortie}
          onChange={(e) => setDateSortie(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes rollout / stratégie"
          className="min-h-40 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  <input
    type="number"
    value={budgetClip}
    onChange={(e) => setBudgetClip(Number(e.target.value))}
    placeholder="Budget clip"
    className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
  />

  <input
    type="number"
    value={budgetCover}
    onChange={(e) => setBudgetCover(Number(e.target.value))}
    placeholder="Budget cover"
    className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
  />

  <input
    type="number"
    value={budgetPromo}
    onChange={(e) => setBudgetPromo(Number(e.target.value))}
    placeholder="Budget promo"
    className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
  />

  <input
    type="number"
    value={budgetStudio}
    onChange={(e) => setBudgetStudio(Number(e.target.value))}
    placeholder="Budget studio"
    className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
  />

  <input
    type="number"
    value={budgetInfluence}
    onChange={(e) => setBudgetInfluence(Number(e.target.value))}
    placeholder="Budget influence"
    className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
  />

  <input
    type="number"
    value={budgetRp}
    onChange={(e) => setBudgetRp(Number(e.target.value))}
    placeholder="Budget RP"
    className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
  />
</div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black"
        >
          Enregistrer
        </button>
        <button
  type="button"
  onClick={handleDelete}
  className="w-full rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 font-semibold text-red-400 hover:bg-red-500/20"
>
  Supprimer le projet
</button>
      </form>
    </main>
  );
}