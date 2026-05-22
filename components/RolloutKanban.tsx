"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { supabaseBrowser } from "../lib/supabase-browser";

type RolloutEvent = {
  id: string;
  titre: string;
  type: string | null;
  statut: string | null;
  date_event: string | null;
  notes: string | null;
  projets?: { id: string; titre: string } | null;
};

const columns = [
  { id: "a-faire", label: "À faire" },
  { id: "en-cours", label: "En cours" },
  { id: "programme", label: "Programmé" },
  { id: "publie", label: "Publié" },
  { id: "annule", label: "Annulé" },
];

export default function RolloutKanban({ events }: { events: RolloutEvent[] }) {
  const [items, setItems] = useState(events);

  async function updateStatus(id: string, newStatus: string) {
    setItems((current) =>
      current.map((event) =>
        event.id === id ? { ...event, statut: newStatus } : event
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

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;

    const column = columns.find(
      (col) => col.id === result.destination?.droppableId
    );

    if (!column) return;

    await updateStatus(result.draggableId, column.label);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {columns.map((column) => {
          const columnEvents = items.filter(
            (event) => (event.statut || "À faire") === column.label
          );

          return (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <section
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[500px] rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-semibold">{column.label}</h2>
                    <span className="text-sm text-zinc-500">
                      {columnEvents.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {columnEvents.map((event, index) => (
                      <Draggable
                        key={event.id}
                        draggableId={event.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`rounded-2xl border border-zinc-800 bg-black p-4 transition ${
                              snapshot.isDragging
                                ? "scale-[1.02] border-white shadow-2xl"
                                : ""
                            }`}
                          >
                            <p className="text-xs text-zinc-500">
                              {event.type || "Rollout"}
                            </p>

                            <h3 className="mt-2 font-semibold">
                              {event.titre}
                            </h3>

                            <p className="mt-2 text-sm text-zinc-400">
                              {event.projets?.titre || "Projet non lié"}
                            </p>

                            <p className="mt-2 text-sm text-zinc-500">
                              {event.date_event || "Date non renseignée"}
                            </p>

                            <select
                              value={event.statut || "À faire"}
                              onChange={(e) =>
                                updateStatus(event.id, e.target.value)
                              }
                              className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white"
                            >
                              {columns.map((column) => (
                                <option key={column.id} value={column.label}>
                                  {column.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                </section>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}