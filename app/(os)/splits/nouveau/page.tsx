"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function NouveauSplitPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [titre, setTitre] = useState("");
  const [projetId, setProjetId] = useState("");
  const [artisteId, setArtisteId] = useState("");
  const [notes, setNotes] = useState("");

  const [projets, setProjets] = useState<any[]>([]);
  const [artistes, setArtistes] = useState<any[]>([]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
  async function loadData() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabaseBrowser
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== ROLES.SUPER_ADMIN &&
      profile?.role !== ROLES.ADMIN &&
      profile?.role !== ROLES.ARTISTIC_DIRECTOR &&
      profile?.role !== ROLES.MANAGER
    ) {
      router.push("/");
      return;
    }

    setCurrentUserId(user.id);
    setCurrentRole(profile.role);

    if (profile.role === ROLES.MANAGER) {
      const { data: artistesData } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .eq("manager_id", profile.id)
        .order("nom");

      const artisteIds = (artistesData || []).map(
        (artiste: any) => artiste.id
      );

      let projetsData: any[] = [];

      if (artisteIds.length > 0) {
        const { data } = await supabaseBrowser
          .from("projets")
          .select("id, titre, artiste_id")
          .in("artiste_id", artisteIds)
          .order("titre");

        projetsData = data || [];
      }

      setArtistes(artistesData || []);
      setProjets(projetsData);
      return;
    }

    const { data: projetsData } = await supabaseBrowser
      .from("projets")
      .select("id,titre")
      .order("titre");

    const { data: artistesData } = await supabaseBrowser
      .from("artistes")
      .select("id,nom")
      .order("nom");

    setArtistes(artistesData || []);
    setProjets(projetsData || []);
  }

  loadData();
}, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    if (!currentRole) {
  alert("Impossible de vérifier tes permissions.");
  setSaving(false);
  return;
}

if (currentRole === ROLES.MANAGER) {
  const artisteAutorise = artistes.some(
    (artiste: any) => artiste.id === artisteId
  );

  const projetAutorise =
    !projetId ||
    projets.some((projet: any) => projet.id === projetId);

  if (!artisteAutorise || !projetAutorise) {
    alert("Tu ne peux créer un split que pour tes artistes.");
    setSaving(false);
    return;
  }
}

    const { data, error } = await supabaseBrowser
      .from("splits")
      .insert({
  titre,
  projet_id: projetId || null,
  artiste_id: artisteId || null,
  notes,
  statut: "Brouillon",
  created_by: currentUserId,
})
      .select()
      .single();

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/splits/${data.id}`);
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Royalties
        </p>

        <h1 className="text-5xl font-bold">
          Nouveau Split Sheet
        </h1>

        <p className="mt-3 text-zinc-400">
          Création d'une répartition de droits.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          required
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre du morceau"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

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
          value={projetId}
          onChange={(e) => setProjetId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option value="">Choisir un projet</option>

          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.titre}
            </option>
          ))}
        </select>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Création..." : "Créer le split sheet"}
        </button>
      </form>
    </main>
  );
}