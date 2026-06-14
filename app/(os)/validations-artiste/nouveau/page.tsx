"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function NouvelleValidationArtistePage() {
  const router = useRouter();

  const [artistes, setArtistes] = useState<any[]>([]);
  const [artisteId, setArtisteId] = useState("");
  const [type, setType] = useState("Sortie");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [lien, setLien] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        profile?.role !== ROLES.SUPER_ADMIN &&
        profile?.role !== ROLES.ADMIN &&
        profile?.role !== ROLES.MANAGER
      ) {
        window.location.href = "/";
        return;
      }

      const { data } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      setArtistes(data || []);
    }

    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!artisteId || !titre) {
      alert("Artiste et titre obligatoires.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseBrowser.from("artist_approvals").insert({
      artiste_id: artisteId,
      type,
      titre,
      description: description || null,
      lien: lien || null,
      statut: "En attente",
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    const { data: artisteProfiles } = await supabaseBrowser
      .from("profiles")
      .select("id")
      .eq("artiste_id", artisteId)
      .eq("role", ROLES.ARTISTE);

    if (artisteProfiles && artisteProfiles.length > 0) {
      await supabaseBrowser.from("notifications").insert(
        artisteProfiles.map((profile) => ({
          user_id: profile.id,
          type: "Validation",
          titre: "Nouvelle validation demandée",
          description: `${type} • ${titre}`,
          lien: "/mon-espace-artiste/validations",
          lu: false,
        }))
      );
    }

    router.push("/validations-artiste");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouvelle validation artiste</h1>
        <p className="mt-3 text-zinc-400">
          Envoie une demande de validation à un artiste.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <select
          value={artisteId}
          onChange={(e) => setArtisteId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option value="">Choisir un artiste</option>
          {artistes.map((artiste) => (
            <option key={artiste.id} value={artiste.id}>
              {artiste.nom}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option>Sortie</option>
          <option>Contrat</option>
          <option>Split Sheet</option>
          <option>Cover</option>
          <option>Événement</option>
          <option>Document</option>
        </select>

        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre de la validation"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <input
          value={lien}
          onChange={(e) => setLien(e.target.value)}
          placeholder="Lien interne optionnel"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description / détails à valider"
          className="min-h-36 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Création..." : "Envoyer à l’artiste"}
        </button>
      </form>
    </main>
  );
}