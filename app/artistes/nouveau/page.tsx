"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase-browser";
import UploadArtisteImage from "../../../components/UploadArtisteImage";

export default function NouvelArtistePage() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [instagram, setInstagram] = useState("");
  const [style, setStyle] = useState("");
  const [statut, setStatut] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser
      .from("artistes")
      .insert({
        nom,
        instagram,
        style,
        statut,
        bio,
        photo_url: photoUrl,
      });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/artistes");
    router.refresh();
  }

  return (
    <main className="p-10 text-white">
      <div className="mb-8">
        <h1 className="text-5xl font-bold">
          Nouvel artiste
        </h1>

        <p className="mt-2 text-zinc-400">
          Ajouter un artiste dans LMG OS
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
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

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black transition hover:opacity-90"
          >
            Créer l’artiste
          </button>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Photo artiste
          </h2>

          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Preview artiste"
              className="mb-5 h-72 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="mb-5 flex h-72 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500">
              Preview image
            </div>
          )}

          <UploadArtisteImage onUpload={setPhotoUrl} />
        </div>
      </form>
    </main>
  );
}