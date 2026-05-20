"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function KanbanBoard({
  taches,
}: {
  taches: any[];
}) {
  const router = useRouter();

  const colonnes = {
    "À faire": taches.filter(
      (t) =>
        !t.statut ||
        t.statut === "À faire" ||
        t.statut === "A faire"
    ),

    "En cours": taches.filter(
      (t) => t.statut === "En cours"
    ),

    "Terminé": taches.filter(
      (t) =>
        t.statut === "Terminé" ||
        t.statut === "Termine"
    ),
  };

  async function onDragEnd(result: any) {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    const { error } = await supabase
      .from("taches")
      .update({
        statut: newStatus,
      })
      .eq("id", taskId);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {Object.entries(colonnes).map(
          ([colonne, items]) => (

            <Droppable
              droppableId={colonne}
              key={colonne}
            >
              {(provided) => (
                <section
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 min-h-[600px]"
                >

                  <div className="flex items-center justify-between mb-5">

                    <h2 className="text-xl font-semibold">
                      {colonne}
                    </h2>

                    <span className="text-sm text-zinc-500">
                      {items.length}
                    </span>

                  </div>

                  <div className="space-y-4">

                    {items.map((tache, index) => (

                      <Draggable
                        draggableId={tache.id}
                        index={index}
                        key={tache.id}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"
                          >

                            <div className="flex items-start justify-between gap-4 mb-3">

                              <h3 className="font-semibold">
                                {tache.titre}
                              </h3>

                              <span className="text-xs text-zinc-400">
                                {tache.priorite || "Priorité"}
                              </span>

                            </div>

                            {tache.description && (
                              <p className="text-sm text-zinc-400 mb-4">
                                {tache.description}
                              </p>
                            )}

                            <div className="space-y-1 text-sm text-zinc-500">

                              <p>
                                Deadline :{" "}
                                {tache.deadline ||
                                  "Non renseignée"}
                              </p>

                            </div>

                          </div>
                        )}
                      </Draggable>

                    ))}

                    {provided.placeholder}

                  </div>

                </section>
              )}
            </Droppable>

          )
        )}

      </div>
    </DragDropContext>
  );
}