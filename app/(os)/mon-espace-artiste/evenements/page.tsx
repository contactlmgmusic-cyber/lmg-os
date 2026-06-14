"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function EvenementsArtistePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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
      .select("role, artiste_id")
      .eq("id", user.id)
      .single();

    if (profile?.role !== ROLES.ARTISTE || !profile.artiste_id) {
      window.location.href = "/";
      return;
    }

    const { data } = await supabaseBrowser
      .from("artiste_events")
      .select("*")
      .eq("artiste_id", profile.artiste_id)
      .order("date_event", { ascending: true });

    setEvents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function checkIn(event: any) {
    const { error } = await supabaseBrowser
      .from("artiste_events")
      .update({
        statut: "En cours",
        checkin_at: new Date().toISOString(),
      })
      .eq("id", event.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  async function completeEvent(event: any) {
    const { error } = await supabaseBrowser
      .from("artiste_events")
      .update({
        statut: "Terminé",
        completed_at: new Date().toISOString(),
        artiste_feedback: feedback[event.id] || null,
      })
      .eq("id", event.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
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
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Mon espace artiste
        </p>

        <h1 className="text-5xl font-bold">Mes événements</h1>

        <p className="mt-3 text-zinc-400">
          Check-in, suivi et validation de tes événements LMG.
        </p>
      </div>

      <section className="space-y-5">
        {events.length === 0 && (
          <p className="text-zinc-500">Aucun événement prévu.</p>
        )}

        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm text-blue-300">
                  {event.type || "Événement"} • {event.date_event}
                  {event.heure ? ` • ${event.heure}` : ""}
                </p>

                <h2 className="mt-2 text-3xl font-bold">{event.titre}</h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {event.lieu || "Lieu non renseigné"}
                </p>

                {event.description && (
                  <p className="mt-4 max-w-3xl text-zinc-400">
                    {event.description}
                  </p>
                )}
              </div>

              <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                {event.statut || "Prévu"}
              </span>
            </div>

            {event.checkin_at && (
              <p className="mt-4 text-sm text-green-300">
                Check-in effectué :{" "}
                {new Date(event.checkin_at).toLocaleString("fr-FR")}
              </p>
            )}

            {event.completed_at && (
              <p className="mt-2 text-sm text-green-300">
                Terminé : {new Date(event.completed_at).toLocaleString("fr-FR")}
              </p>
            )}

            {event.statut !== "Terminé" && (
              <div className="mt-6 flex flex-col gap-3 md:flex-row">
                {!event.checkin_at && (
                  <button
                    onClick={() => checkIn(event)}
                    className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
                  >
                    ✅ Je suis arrivé
                  </button>
                )}

                {event.checkin_at && (
                  <button
                    onClick={() => completeEvent(event)}
                    className="rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-3 font-semibold text-green-300 hover:bg-green-500/20"
                  >
                    🏁 Événement terminé
                  </button>
                )}
              </div>
            )}

            {event.checkin_at && event.statut !== "Terminé" && (
              <textarea
                value={feedback[event.id] || ""}
                onChange={(e) =>
                  setFeedback((current) => ({
                    ...current,
                    [event.id]: e.target.value,
                  }))
                }
                placeholder="Feedback rapide après l’événement..."
                className="mt-5 min-h-28 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
              />
            )}

            {event.artiste_feedback && (
              <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-5">
                <p className="text-sm text-zinc-500">Feedback artiste</p>
                <p className="mt-2 text-zinc-300">{event.artiste_feedback}</p>
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}