"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

const types = [
  "Beatmaker",
  "Réalisateur",
  "Photographe",
  "Studio",
  "Ingé son",
  "Graphiste",
  "Attaché de presse",
  "Label",
  "Distributeur",
  "DJ",
  "Booker",
  "Tourneur",
  "Autre",
];

const statuts = [
  "À contacter",
  "Contacté",
  "Relancé",
  "Intéressé",
  "Collaboration",
  "Partenaire actif",
  "Refusé",
];

export default function ModifierPartenairePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nom, setNom] = useState("");
  const [type, setType] = useState("Beatmaker");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [ville, setVille] = useState("");
  const [tarif, setTarif] = useState("");
  const [statut, setStatut] = useState("À contacter");
  const [prochaineRelance, setProchaineRelance] = useState("");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [notes, setNotes] = useState("");

  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: partenaire, error } = await supabaseBrowser
        .from("partenaires")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !partenaire) {
        alert(error?.message || "Partenaire introuvable.");
        router.push("/partenaires");
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

      setNom(partenaire.nom || "");
      setType(partenaire.type || "Beatmaker");
      setEmail(partenaire.email || "");
      setTelephone(partenaire.telephone || "");
      setInstagram(partenaire.instagram || "");
      setSiteWeb(partenaire.site_web || "");
      setVille(partenaire.ville || "");
      setTarif(partenaire.tarif ? String(partenaire.tarif) : "");
      setStatut(partenaire.statut || "À contacter");
      setProchaineRelance(partenaire.prochaine_relance || "");
      setArtisteId(partenaire.artiste_id || "");
      setProjetId(partenaire.projet_id || "");
      setNotes(partenaire.notes || "");

      setArtistes(artistesData || []);
      setProjets(projetsData || []);
      setLoading(false);
    }

    if (id) loadData();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nom.trim()) {
      alert("Le nom est obligatoire.");
      return;
    }

    setSaving(true);

    const { error } = await supabaseBrowser
      .from("partenaires")
      .update({
        nom,
        type,
        email: email || null,
        telephone: telephone || null,
        instagram: instagram || null,
        site_web: siteWeb || null,
        ville: ville || null,
        tarif: tarif ? Number(tarif) : 0,
        statut,
        prochaine_relance: prochaineRelance || null,
        artiste_id: artisteId || null,
        projet_id: projetId || null,
        notes: notes || null,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/partenaires/${id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce partenaire ?")) return;

    const { error } = await supabaseBrowser
      .from("partenaires")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/partenaires");
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
          href={`/partenaires/${id}`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Retour partenaire
        </Link>

        <h1 className="mt-6 text-5xl font-bold">Modifier partenaire</h1>

        <p className="mt-3 text-zinc-400">
          Mets à jour les informations du partenaire.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du partenaire"
          required
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          {types.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

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
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Instagram"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <input
            value={siteWeb}
            onChange={(e) => setSiteWeb(e.target.value)}
            placeholder="Site web"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Ville"
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

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          {statuts.map((item) => (
            <option key={item}>{item}</option>
          ))}
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
          placeholder="Notes internes"
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
          Supprimer le partenaire
        </button>
      </form>
    </main>
  );
}