"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NouveauPartenairePage() {
  const router = useRouter();

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
  const [loading, setLoading] = useState(false);

  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: artistesData } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      const { data: projetsData } = await supabaseBrowser
        .from("projets")
        .select("id, titre")
        .order("titre");

      setArtistes(artistesData || []);
      setProjets(projetsData || []);
    }

    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nom.trim()) {
      alert("Le nom est obligatoire.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseBrowser.from("partenaires").insert({
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
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/partenaires");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouveau partenaire</h1>

        <p className="mt-3 text-zinc-400">
          Ajouter un beatmaker, studio, photographe, réalisateur, label ou autre partenaire LMG.
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
          <option>À contacter</option>
          <option>Contacté</option>
          <option>Relancé</option>
          <option>Intéressé</option>
          <option>Collaboration</option>
          <option>Partenaire actif</option>
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
          placeholder="Notes internes"
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer le partenaire"}
        </button>
      </form>
    </main>
  );
}