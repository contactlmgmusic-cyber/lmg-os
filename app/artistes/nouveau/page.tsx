"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NouvelArtistePage() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [style, setStyle] = useState("");
  const [statut, setStatut] = useState("");
  const [instagram, setInstagram] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  async function ajouterArtiste(e: React.FormEvent) {
    e.preventDefault();

    let photoUrl = "";

    if (photo) {
      const fileName = `${Date.now()}-${photo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("artist-photos")
        .upload(fileName, photo);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("artist-photos")
        .getPublicUrl(fileName);

      photoUrl = data.publicUrl;
    }

    const { error } = await supabase.from("artistes").insert({
      nom,
      style,
      statut,
      instagram,
      notes,
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
      <h1 className="text-4xl font-bold mb-8">Nouvel artiste</h1>

      <form onSubmit={ajouterArtiste} className="max-w-xl space-y-5">
        <input
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Nom de l’artiste"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Style musical"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Statut"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Instagram"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />

        <textarea
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        />

        <button
          type="submit"
          className="rounded-xl bg-white text-black px-6 py-4 font-semibold"
        >
          Créer l’artiste
        </button>
      </form>
    </main>
  );
}