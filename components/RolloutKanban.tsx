"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  projets?: {
    id: string;
    titre: string;
  } | null;
};

const columns = ["À faire", "En cours", "Programmé", "Publié", "Annulé"];

export default function RolloutKanban({
  events,
}: {
  events: RolloutEvent[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(events);

  async function onDragEnd(result: DropResult) {
    const { destination, draggableId } = result;

    if (!destination) return;

    const newStatus = destination.droppableId;

    setItems((current) =>
      current.map((event) =>
        event.id === draggableId
          ? { ...event, statut: newStatus }
          : event
      )
    );

    const { error } = await supabaseBrowser
      .from("rollout_events")
      .update({ statut: newStatus })
      .eq("id", draggableId);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {columns.map((column) => {
          const columnEvents = items.filter(
            (event) => (event.statut || "À faire") === column
          );

          return (
            <Droppable droppableId={column} key={column}>
              {(provided) => (
                <section
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[500px] rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-semibold">{column}</h2>
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

                            {event.notes && (
                              <p className="mt-3 line-clamp-3 text-sm text-zinc-600">
                                {event.notes}
                              </p>
                            )}
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