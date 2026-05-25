"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Asset = {
  id: string;
  nom: string;
  url: string;
  type: string;
};

export default function AssetUploader({
  tacheId,
  projetId,
  artisteId,
  initialAssets = [],
}: {
  tacheId?: string;
  projetId?: string;
  artisteId?: string;
  initialAssets?: Asset[];
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const filePath = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from("lmg-assets")
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabaseBrowser.storage
      .from("lmg-assets")
      .getPublicUrl(filePath);

    const { data: asset, error } = await supabaseBrowser
      .from("assets")
      .insert({
        nom: file.name,
        url: data.publicUrl,
        type: file.type,
        tache_id: tacheId || null,
        projet_id: projetId || null,
        artiste_id: artisteId || null,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    setAssets([asset, ...assets]);
    setUploading(false);
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Assets</h2>
          <p className="text-sm text-zinc-500">
            Covers, contrats, vidéos, fichiers promo.
          </p>
        </div>

        <label className="cursor-pointer rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200">
          {uploading ? "Upload..." : "+ Ajouter"}

          <input type="file" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="space-y-3">
        {assets.length === 0 && (
          <p className="text-sm text-zinc-500">Aucun asset ajouté.</p>
        )}

        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div>
              <p className="font-medium text-white">{asset.nom}</p>
              <p className="text-sm text-zinc-500">{asset.type}</p>
            </div>

            <a
              href={asset.url}
              target="_blank"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Ouvrir
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}