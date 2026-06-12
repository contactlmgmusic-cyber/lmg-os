"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default async function ModifierInfluenceurPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nom, setNom] = useState("");
  const [plateforme, setPlateforme] = useState("Instagram");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [audience, setAudience] = useState("");
  const [tarif, setTarif] = useState("");
  const [categorie, setCategorie] = useState("");
  const [pays, setPays] = useState("");
  const [statut, setStatut] = useState("À contacter");
  const [prochaineRelance, setProchaineRelance] = useState("");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [notes, setNotes] = useState("");

  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: influenceur, error } = await supabaseBrowser
        .from("influenceurs")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !influenceur) {
        alert(error?.message || "Influenceur introuvable.");
        router.push("/influenceurs");
        return;
      }

      const { data: artistesData } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      const { data: projetsData } = await supabaseBrowser
        .from("projets")
        .select("id, titre")
        .order("titre");

      setNom(influenceur.nom || "");
      setPlateforme(influenceur.plateforme || "Instagram");
      setPseudo(influenceur.pseudo || "");
      setEmail(influenceur.email || "");
      setTelephone(influenceur.telephone || "");
      setAudience(influenceur.audience ? String(influenceur.audience) : "");
      setTarif(influenceur.tarif ? String(influenceur.tarif) : "");
      setCategorie(influenceur.categorie || "");
      setPays(influenceur.pays || "");
      setStatut(influenceur.statut || "À contacter");
      setProchaineRelance(influenceur.prochaine_relance || "");
      setArtisteId(influenceur.artiste_id || "");
      setProjetId(influenceur.projet_id || "");
      setNotes(influenceur.notes || "");

      setArtistes(artistesData || []);
      setProjets(projetsData || []);
      setLoading(false);
    }

    if (id) {
      loadData();
    }
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nom.trim()) {
      alert("Le nom est obligatoire.");
      return;
    }

    setSaving(true);

    const { error } = await supabaseBrowser
      .from("influenceurs")
      .update({
        nom,
        plateforme,
        pseudo,
        email,
        telephone,
        audience: audience ? Number(audience) : 0,
        tarif: tarif ? Number(tarif) : 0,
        categorie,
        pays,
        statut,
        prochaine_relance: prochaineRelance || null,
        artiste_id: artisteId || null,
        projet_id: projetId || null,
        notes,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/influenceurs/${id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Tu es sûre de vouloir supprimer cet influenceur ?")) return;

    const { error } = await supabaseBrowser
      .from("influenceurs")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/influenceurs");
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
          href={`/influenceurs/${id}`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Retour influenceur
        </Link>

        <h1 className="mt-6 text-5xl font-bold">Modifier influenceur</h1>

        <p className="mt-3 text-zinc-400">
          Mets à jour les informations du créateur.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom de l'influenceur"
          required
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <select
          value={plateforme}
          onChange={(e) => setPlateforme(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option>Instagram</option>
          <option>TikTok</option>
          <option>YouTube</option>
          <option>Twitch</option>
          <option>Snapchat</option>
          <option>Autre</option>
        </select>

        <input
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="@pseudo"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Téléphone"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            type="number"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Audience / abonnés"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <input
            type="number"
            value={tarif}
            onChange={(e) => setTarif(e.target.value)}
            placeholder="Tarif estimé (€)"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            placeholder="Catégorie : rap, lifestyle, danse..."
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <input
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            placeholder="Pays"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />
        </div>

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option>À contacter</option>
          <option>Contacté</option>
          <option>Relancé</option>
          <option>Intéressé</option>
          <option>Campagne lancée</option>
          <option>Publié</option>
          <option>Refusé</option>
        </select>

        <input
          type="date"
          value={prochaineRelance}
          onChange={(e) => setProchaineRelance(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <select
          value={artisteId}
          onChange={(e) => setArtisteId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option value="">Aucun artiste lié</option>

          {artistes.map((artiste) => (
            <option key={artiste.id} value={artiste.id}>
              {artiste.nom}
            </option>
          ))}
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

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes campagne / échange / proposition"
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 font-medium text-red-400 hover:bg-red-500/20"
        >
          Supprimer l'influenceur
        </button>
      </form>
    </main>
  );
}