"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";
import DeleteArtistEventButton from "@/components/DeleteArtistEventButton";

export default function ModifierEvenementArtistePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [artistes, setArtistes] = useState<any[]>([]);
  const [artisteId, setArtisteId] = useState("");
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("Rendez-vous manager");
  const [dateEvent, setDateEvent] = useState("");
  const [heure, setHeure] = useState("");
  const [lieu, setLieu] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("Prévu");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      const { data: event, error } = await supabaseBrowser
        .from("artiste_events")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !event) {
        alert(error?.message || "Événement introuvable.");
        router.push("/artiste-events");
        return;
      }

      const { data: artistesData } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      setArtistes(artistesData || []);
      setArtisteId(event.artiste_id || "");
      setTitre(event.titre || "");
      setType(event.type || "Rendez-vous manager");
      setDateEvent(event.date_event || "");
      setHeure(event.heure || "");
      setLieu(event.lieu || "");
      setDescription(event.description || "");
      setStatut(event.statut || "Prévu");
      setLoading(false);
    }

    if (id) loadData();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!artisteId || !titre || !dateEvent) {
      alert("Artiste, titre et date sont obligatoires.");
      return;
    }

    setSaving(true);

    const { error } = await supabaseBrowser
      .from("artiste_events")
      .update({
        artiste_id: artisteId,
        titre,
        type,
        date_event: dateEvent,
        heure: heure || null,
        lieu: lieu || null,
        description: description || null,
        statut,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Événement artiste",
      titre: "Événement artiste modifié",
      description: `${type} • ${titre}`,
      artiste_id: artisteId,
    });

    router.push("/artiste-events");
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
      <Link href="/artiste-events" className="text-sm text-zinc-400 hover:text-white">
        ← Retour aux événements
      </Link>

      <div className="mb-10 mt-8">
        <h1 className="text-5xl font-bold">Modifier événement artiste</h1>

        <p className="mt-3 text-zinc-400">
          Modifie une répétition, session studio, shooting, tournage ou rendez-vous.
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

        <div className="flex flex-col gap-4 md:flex-row">
          <button
            disabled={saving}
            className="flex-1 rounded-xl bg-white px-5 py-4 font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>

          <DeleteArtistEventButton eventId={id} />
        </div>
      </form>
    </main>
  );
}