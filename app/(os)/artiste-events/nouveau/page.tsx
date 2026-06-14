"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function NouvelEvenementArtistePage() {
  const router = useRouter();

  const [artistes, setArtistes] = useState<any[]>([]);
  const [artisteId, setArtisteId] = useState("");
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("Rendez-vous manager");
  const [dateEvent, setDateEvent] = useState("");
  const [heure, setHeure] = useState("");
  const [lieu, setLieu] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("Prévu");
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

    if (!artisteId || !titre || !dateEvent) {
      alert("Artiste, titre et date sont obligatoires.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseBrowser.from("artiste_events").insert({
  artiste_id: artisteId,
  titre,
  type,
  date_event: dateEvent,
  heure: heure || null,
  lieu: lieu || null,
  description: description || null,
  statut,
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
      type: "Événement",
      titre: "Nouvel événement artiste",
      description: `${type} • ${titre}`,
      lien: "/mon-espace-artiste/calendrier",
      lu: false,
    }))
  );
}

await supabaseBrowser.from("activity_logs").insert({
  type: "Événement artiste",
  titre: "Nouvel événement ajouté",
  description: `${type} • ${titre}`,
  artiste_id: artisteId,
});

router.push("/calendrier");
router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouvel événement artiste</h1>
        <p className="mt-3 text-zinc-400">
          Ajoute une répétition, session studio, shooting, tournage ou rendez-vous.
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

        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre de l’événement"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option>Rendez-vous manager</option>
          <option>Répétition</option>
          <option>Session studio</option>
          <option>Shooting photo</option>
          <option>Tournage clip</option>
          <option>Interview</option>
          <option>Événement promo</option>
        </select>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            type="date"
            value={dateEvent}
            onChange={(e) => setDateEvent(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            value={heure}
            onChange={(e) => setHeure(e.target.value)}
            placeholder="Heure ex : 18h30"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />
        </div>

        <input
          value={lieu}
          onChange={(e) => setLieu(e.target.value)}
          placeholder="Lieu"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option>Prévu</option>
          <option>Confirmé</option>
          <option>Terminé</option>
          <option>Annulé</option>
        </select>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description / notes"
          className="min-h-36 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer l’événement"}
        </button>
      </form>
    </main>
  );
}