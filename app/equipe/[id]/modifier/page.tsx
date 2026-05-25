"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase-browser";

type Artiste = {
  id: string;
  nom: string;
};

export default function ModifierMembrePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [role, setRole] = useState("member");
  const [artisteId, setArtisteId] = useState("");
  const [artistes, setArtistes] = useState<Artiste[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: profile, error } = await supabaseBrowser
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      const { data: artistesData } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom", { ascending: true });

      setNom(profile.nom || "");
      setRole(profile.role || "member");
      setArtisteId(profile.artiste_id || "");
      setArtistes(artistesData || []);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser
      .from("profiles")
      .update({
        nom,
        role,
        artiste_id: artisteId || null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/equipe");
    router.refresh();
  }

  if (loading) {
    return <main className="p-10 text-white">Chargement...</main>;
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Modifier membre</h1>

        <p className="mt-3 text-zinc-400">
          Modifier le nom, le rôle et l’artiste lié.
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="max-w-2xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du membre"
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
          <option value="artist">Artist</option>
          <option value="guest">Guest</option>
        </select>

        <select
          value={artisteId}
          onChange={(e) => setArtisteId(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Aucun artiste lié</option>

          {artistes.map((artiste) => (
            <option key={artiste.id} value={artiste.id}>
              {artiste.nom}
            </option>
          ))}
        </select>

        <button className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black">
          Enregistrer
        </button>
      </form>
    </main>
  );
}