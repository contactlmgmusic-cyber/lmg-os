"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NouvelArtistePage() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [instagram, setInstagram] = useState("");
  const [style, setStyle] = useState("");
  const [statut, setStatut] = useState("Prospect");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nom.trim()) {
      alert("Le nom de l’artiste est obligatoire.");
      return;
    }

    setLoading(true);

    const { data: artiste, error } = await supabaseBrowser
      .from("artistes")
      .insert({
        nom,
        instagram,
        style,
        statut,
        bio,
        photo_url: photoUrl,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (artiste) {
      const slug = slugify(artiste.nom);

      await supabaseBrowser.from("chat_channels").insert({
        name: artiste.nom,
        slug: `artiste-${slug}`,
        type: "artiste",
        artiste_id: artiste.id,
      });

      const { data: admins } = await supabaseBrowser
        .from("profiles")
        .select("id")
        .in("role", ["admin", "manager"]);

      if (admins && admins.length > 0) {
        await supabaseBrowser.from("notifications").insert(
          admins.map((admin) => ({
            user_id: admin.id,
            type: "artiste",
            titre: "Nouvel artiste créé",
            description: artiste.nom,
            link: `/artistes/${artiste.id}`,
          }))
        );
      }
    }

    router.push("/artistes");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouvel artiste</h1>

        <p className="mt-3 text-zinc-400">
          Ajouter un artiste au roster LMG.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid max-w-6xl grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]"
      >
        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom artiste"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Instagram"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <input
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="Style musical"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          >
            <option value="Prospect">Prospect</option>
            <option value="Signé">Signé</option>
            <option value="Priorité LMG">Priorité LMG</option>
            <option value="Développement">Développement</option>
            <option value="Indépendant">Indépendant</option>
          </select>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio / notes artiste"
            className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer l’artiste"}
          </button>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-2xl font-bold">Photo artiste</h2>

          {photoUrl && (
            <img
              src={photoUrl}
              alt="Preview artiste"
              className="mb-6 h-80 w-full rounded-2xl object-cover"
            />
          )}

          <input
  value={photoUrl}
  onChange={(e) => setPhotoUrl(e.target.value)}
  placeholder="URL photo artiste"
  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
/>
        </div>
      </form>
    </main>
  );
}