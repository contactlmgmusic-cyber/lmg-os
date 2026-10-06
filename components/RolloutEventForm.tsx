"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Projet = {
  id: string;
  titre: string;
};

type Event = { id: string; titre: string; type: string | null; statut: string | null; date_event: string | null; notes: string | null; projet_id: string | null };
export default function RolloutEventForm({ event, initialProjectId = "" }: { event?: Event; initialProjectId?: string }) {
  const router = useRouter();

  const [titre, setTitre] = useState(event?.titre || "");
  const [type, setType] = useState(event?.type || "");
  const [statut, setStatut] = useState(event?.statut || "");
  const [dateEvent, setDateEvent] = useState(event?.date_event?.slice(0, 10) || "");
  const [notes, setNotes] = useState(event?.notes || "");
  const [projetId, setProjetId] = useState(event?.projet_id || initialProjectId);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [projets, setProjets] = useState<Projet[]>([]);

  useEffect(() => {
    async function fetchProjets() {
      const { data, error } = await supabaseBrowser
        .from("projets")
        .select("id, titre")
        .order("titre");

      if (error) {
        alert(error.message);
        return;
      }

      setProjets(data || []);
    }

    fetchProjets();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titre.trim()) { setMessage("Renseigne le titre de l’action."); return; }
    setSaving(true); setMessage("");
    try {
      const values = { titre: titre.trim(), type, statut, date_event: dateEvent || null, notes, projet_id: projetId || null };
      const query = event ? supabaseBrowser.from("rollout_events").update(values).eq("id", event.id) : supabaseBrowser.from("rollout_events").insert(values);
      const { data, error } = await query.select("id").single();
      if (error || !data) { setMessage("Enregistrement impossible. Vérifie tes droits et réessaie."); return; }
      router.push(`/rollout/${data.id}`); router.refresh();
    } catch { setMessage("Connexion interrompue. Réessaie."); }
    finally { setSaving(false); }
  }

  return (
    <main className="p-10 text-white">
      <Link href={event ? `/rollout/${event.id}` : "/rollout"} className="mb-6 block text-sm text-zinc-400 hover:text-white">← Retour au rollout</Link>
      <div className="mb-8">
        <h1 className="text-5xl font-bold">{event ? "Modifier l’action rollout" : "Nouvelle action rollout"}</h1>
        <p className="mt-2 text-zinc-400">
          Planifier une action promo liée à un projet.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre de l’action"
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Type d’action</option>
          <option value="Teaser">Teaser</option>
          <option value="Snippet">Snippet</option>
          <option value="Cover reveal">Cover reveal</option>
          <option value="Pre-save">Pre-save</option>
          <option value="Release day">Release day</option>
          <option value="Clip">Clip</option>
          <option value="TikTok">TikTok</option>
          <option value="Instagram">Instagram</option>
          <option value="Shooting">Shooting</option>
          <option value="Interview">Interview</option>
        </select>

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Statut</option>
          <option value="À faire">À faire</option>
          <option value="En cours">En cours</option>
          <option value="Programmé">Programmé</option>
          <option value="Publié">Publié</option>
          <option value="Annulé">Annulé</option>
        </select>

        <input
          type="date"
          value={dateEvent}
          onChange={(e) => setDateEvent(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        />

        <select
          value={projetId}
          onChange={(e) => setProjetId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Sélectionner un projet</option>
          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.titre}
            </option>
          ))}
        </select>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes / brief / consignes..."
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black transition hover:opacity-90"
        >
          {saving ? "Enregistrement…" : event ? "Enregistrer les modifications" : "Créer l’action rollout"}
        </button>
        {message && <p role="alert" className="text-sm text-red-400">{message}</p>}
      </form>
    </main>
  );
}