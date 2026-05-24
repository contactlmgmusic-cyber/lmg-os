"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { supabaseBrowser } from "../lib/supabase-browser";

type Profile = {
  id: string;
  nom: string | null;
  avatar_url: string | null;
  role: string | null;
};

type Tache = {
  id: string;
  titre: string;
  description: string | null;
  statut: string | null;
  priorite: string | null;
  deadline: string | null;
  responsable_id?: string | null;
  profiles?: Profile | null;
};

const colonnes = ["À faire", "En cours", "Terminé"];

function normalizeStatut(statut: string | null) {
  if (!statut) return "À faire";

  const value = statut.trim().toLowerCase();

  if (value === "à faire" || value === "a faire" || value === "todo") {
    return "À faire";
  }

  if (value === "en cours" || value === "encours") {
    return "En cours";
  }

  if (value === "terminé" || value === "termine" || value === "done") {
    return "Terminé";
  }

  return "À faire";
}

export default function KanbanBoard({ taches }: { taches: Tache[] }) {
  const [items, setItems] = useState(
    taches.map((tache) => ({
      ...tache,
      statut: normalizeStatut(tache.statut),
    }))
  );

  useEffect(() => {
    const channel = supabaseBrowser
      .channel("realtime-taches")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "taches",
        },
        async () => {
          const { data } = await supabaseBrowser
            .from("taches")
            .select(`
              *,
              profiles!taches_responsable_id_fkey (
                id,
                nom,
                avatar_url,
                role
              )
            `)
            .order("created_at", { ascending: false });

          setItems(
            (data || []).map((tache: Tache) => ({
              ...tache,
              statut: normalizeStatut(tache.statut),
            }))
          );
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  async function updateStatus(id: string, statut: string) {
    const currentTask = items.find((tache) => tache.id === id);

    setItems((current) =>
      current.map((tache) =>
        tache.id === id ? { ...tache, statut } : tache
      )
    );

    const { error } = await supabaseBrowser
      .from("taches")
      .update({ statut })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Tâche",
      titre: "Tâche déplacée",
      description: `${currentTask?.titre || "Tâche"} → ${statut}`,
    });
  }

  async function onDragEnd(result: DropResult) {
    const { destination, draggableId } = result;

    if (!destination) return;

    const newStatus = destination.droppableId;

    if (!colonnes.includes(newStatus)) return;

    await updateStatus(draggableId, newStatus);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {colonnes.map((colonne) => {
          const tachesColonne = items.filter(
            (tache) => tache.statut === colonne
          );

          return (
            <Droppable droppableId={colonne} key={colonne}>
              {(provided, snapshot) => (
                <section
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-3xl border p-6 transition ${
                    snapshot.isDraggingOver
                      ? "border-white bg-zinc-800"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{colonne}</h2>

                    <span className="rounded-full bg-black px-3 py-1 text-sm text-zinc-400">
                      {tachesColonne.length}
                    </span>
                  </div>

                  <div className="min-h-[400px] space-y-4">
                    {tachesColonne.length === 0 && (
                      <p className="text-sm text-zinc-500">Aucune tâche ici.</p>
                    )}

                    {tachesColonne.map((tache, index) => (
                      <Draggable
                        key={tache.id}
                        draggableId={tache.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`rounded-3xl border border-zinc-800 bg-black p-5 transition ${
                              snapshot.isDragging
                                ? "scale-[1.02] border-white shadow-2xl"
                                : ""
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <a href={`/taches/${tache.id}`} className="block">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="text-lg font-bold">
                                      {tache.titre}
                                    </h3>

                                    {tache.description && (
                                      <p className="mt-2 text-sm text-zinc-400">
                                        {tache.description}
                                      </p>
                                    )}
                                  </div>

                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                      tache.priorite === "Haute"
                                        ? "bg-red-500/20 text-red-300"
                                        : tache.priorite === "Moyenne"
                                        ? "bg-orange-500/20 text-orange-300"
                                        : "bg-zinc-800 text-zinc-300"
                                    }`}
                                  >
                                    {tache.priorite || "Basse"}
                                  </span>
                                </div>
                              </a>

                              <div className="mt-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-sm font-bold">
                                    {tache.profiles?.avatar_url ? (
                                      <img
                                        src={tache.profiles.avatar_url}
                                        alt={tache.profiles.nom || ""}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      tache.profiles?.nom
                                        ?.charAt(0)
                                        ?.toUpperCase() || "L"
                                    )}
                                  </div>

                                  <div>
                                    <p className="text-sm font-medium">
                                      {tache.profiles?.nom || "Non assigné"}
                                    </p>

                                    <p className="text-xs text-zinc-500">
                                      {tache.profiles?.role || "member"}
                                    </p>
                                  </div>
                                </div>

                                {tache.deadline && (
                                  <div className="text-right">
                                    <p className="text-xs text-zinc-500">
                                      Deadline
                                    </p>
                                    <p className="text-sm">{tache.deadline}</p>
                                  </div>
                                )}
                              </div>
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
          );
        })}
      </div>
    </DragDropContext>
  );
}