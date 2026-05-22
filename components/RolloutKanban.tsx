"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type RolloutEvent = {
  id: string;
  titre: string;
  type: string | null;
  statut: string | null;
  date_event: string | null;
  notes: string | null;
  projets?: {
    id: string;
    titre: string;
  } | null;
};

const columns = [
  "À faire",
  "En cours",
  "Programmé",
  "Publié",
  "Annulé",
];

export default function RolloutKanban({
  events,
}: {
  events: RolloutEvent[];
}) {
  const [items, setItems] = useState(events);

  async function updateStatus(
    id: string,
    newStatus: string
  ) {
    setItems((current) =>
      current.map((event) =>
        event.id === id
          ? { ...event, statut: newStatus }
          : event
      )
    );

    const { error } = await supabaseBrowser
      .from("rollout_events")
      .update({ statut: newStatus })
      .eq("id", id);

    if (error) {
      alert(error.message);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      {columns.map((column) => {
        const columnEvents = items.filter(
          (event) =>
            (event.statut || "À faire") === column
        );

        return (
          <section
            key={column}
            className="min-h-[500px] rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold">
                {column}
              </h2>

              <span className="text-sm text-zinc-500">
                {columnEvents.length}
              </span>
            </div>

            <div className="space-y-4">
              {columnEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-4"
                >
                  <p className="text-xs text-zinc-500">
                    {event.type || "Rollout"}
                  </p>

                  <a
                    href={`/rollout/${event.id}`}
                    className="mt-2 block text-lg font-semibold text-white hover:underline"
                  >
                    {event.titre}
                  </a>

                  <p className="mt-2 text-sm text-zinc-400">
                    {event.projets?.titre ||
                      "Projet non lié"}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    {event.date_event ||
                      "Date non renseignée"}
                  </p>

                  {event.notes && (
                    <p className="mt-3 line-clamp-4 text-sm text-zinc-500">
                      {event.notes}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `/rollout/${event.id}`;
                    }}
                    className="mt-4 w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                  >
                    Ouvrir la fiche
                  </button>

                  <select
                    value={
                      event.statut || "À faire"
                    }
                    onChange={(e) =>
                      updateStatus(
                        event.id,
                        e.target.value
                      )
                    }
                    className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white"
                  >
                    {columns.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}