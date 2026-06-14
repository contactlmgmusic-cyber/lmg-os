"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function NouveauProspectForm() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [type, setType] = useState("Marque");
  const [contactNom, setContactNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("France");
  const [statut, setStatut] = useState("À contacter");
  const [priorite, setPriorite] = useState("Moyenne");
  const [potentielRevenu, setPotentielRevenu] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [prochaineRelance, setProchaineRelance] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkAccess() {
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
      }
    }

    checkAccess();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nom) {
      alert("Le nom du prospect est obligatoire.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    const { error } = await supabaseBrowser.from("prospects_lmg").insert({
      nom,
      type,
      contact_nom: contactNom || null,
      email: email || null,
      telephone: telephone || null,
      instagram: instagram || null,
      site_web: siteWeb || null,
      ville: ville || null,
      pays: pays || "France",
      statut,
      priorite,
      potentiel_revenu: Number(potentielRevenu || 0),
      source: source || null,
      notes: notes || null,
      prochaine_relance: prochaineRelance || null,
      responsable_id: user?.id || null,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/prospects");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouveau prospect</h1>

        <p className="mt-3 text-zinc-400">
          Ajoute une marque, salle, festival, partenaire, label ou opportunité business.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du prospect"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          >
            <option>Marque</option>
            <option>Salle</option>
            <option>Festival</option>
            <option>Label</option>
            <option>Booker</option>
            <option>Partenaire</option>
            <option>Influenceur</option>
            <option>Média</option>
            <option>Autre</option>
          </select>

          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          >
            <option>À contacter</option>
            <option>Contacté</option>
            <option>Relancé</option>
            <option>RDV prévu</option>
            <option>Négociation</option>
            <option>Signé</option>
            <option>Perdu</option>
          </select>

          <select
            value={priorite}
            onChange={(e) => setPriorite(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          >
            <option>Basse</option>
            <option>Moyenne</option>
            <option>Haute</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            value={contactNom}
            onChange={(e) => setContactNom(e.target.value)}
            placeholder="Nom du contact"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Téléphone"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Instagram"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            value={siteWeb}
            onChange={(e) => setSiteWeb(e.target.value)}
            placeholder="Site web"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Ville"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            placeholder="Pays"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            type="number"
            value={potentielRevenu}
            onChange={(e) => setPotentielRevenu(e.target.value)}
            placeholder="Potentiel revenu €"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Source"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            type="date"
            value={prochaineRelance}
            onChange={(e) => setProchaineRelance(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes commerciales"
          className="min-h-36 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer prospect"}
        </button>
      </form>
    </main>
  );
}