"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase-browser";
import UploadArtisteImage from "../../../../components/UploadArtisteImage";
import ImageCropUploader from "@/components/ImageCropUploader";

export default function ModifierArtistePage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);

  const [nom, setNom] = useState("");
  const [instagram, setInstagram] = useState("");
  const [style, setStyle] = useState("");
  const [statut, setStatut] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [managerId, setManagerId] = useState("");
const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchArtiste() {
      const { data, error } = await supabaseBrowser
        .from("artistes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setNom(data.nom || "");
      setInstagram(data.instagram || "");
      setStyle(data.style || "");
      setStatut(data.statut || "");
      setBio(data.bio || data.notes || "");
      setPhotoUrl(data.photo_url || "");
      setManagerId(data.manager_id || "");

      setLoading(false);
    }

    fetchArtiste();
  }, [id]);

  async function fetchManagers() {
  const { data } = await supabaseBrowser
    .from("profiles")
    .select("id, nom, role")
    .in("role", ["admin", "manager"]);

  if (data) {
    setManagers(data);
  }
}

fetchManagers();

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser
      .from("artistes")
      .update({
        nom,
        instagram,
        style,
        statut,
        bio,
        photo_url: photoUrl,
        manager_id: managerId || null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/artistes/${id}`);
    router.refresh();
  }

  async function handleDelete() {
    const confirmation = confirm(
      "Tu es sûre de vouloir supprimer cet artiste ? Cette action est définitive."
    );

    if (!confirmation) return;

    const { error } = await supabaseBrowser
      .from("artistes")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/artistes");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="p-10 text-white">
      <div className="mb-8">
        <h1 className="text-5xl font-bold">
          Modifier artiste
        </h1>

        <p className="mt-2 text-zinc-400">
          Mettre à jour les informations artiste
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom de l’artiste"
            className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
            required
          />

          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Instagram sans @"
            className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          />

          <input
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="Style musical"
            className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          />

          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          >
            <option value="">Statut</option>
            <option value="En développement">En développement</option>
            <option value="Signé">Signé</option>
            <option value="Priorité LMG">Priorité LMG</option>
            <option value="Indépendant">Indépendant</option>
          </select>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio / notes artiste"
            className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          />

<div className="space-y-2">
  <label className="text-sm text-zinc-400">
    Manager
  </label>

  <select
    value={managerId}
    onChange={(e) => setManagerId(e.target.value)}
    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
  >
    <option value="">Aucun manager</option>

    {managers.map((manager) => (
      <option key={manager.id} value={manager.id}>
        {manager.nom} ({manager.role})
      </option>
    ))}
  </select>
</div>

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black transition hover:opacity-90"
          >
            Enregistrer les modifications
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 font-medium text-red-400 transition hover:bg-red-500/20"
          >
            Supprimer l’artiste
          </button>
        </div>

        <div>
  <label className="mb-3 block text-sm text-zinc-400">
    Photo artiste
  </label>

  {photoUrl && (
    <img
      src={photoUrl}
      alt="Artiste"
      className="mb-4 h-32 w-32 rounded-full object-cover"
    />
  )}

  <ImageCropUploader
    folder={`artistes/${id}`}
    onUploaded={(url) => setPhotoUrl(url)}
  />
</div>
      </form>
    </main>
  );
}