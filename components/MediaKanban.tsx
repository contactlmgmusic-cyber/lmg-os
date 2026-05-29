"use client";

import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MediaKanban({
  medias,
}: {
  medias: any[];
}) {
  const router = useRouter();

  const statuses = [
    "À contacter",
    "Contacté",
    "Relancé",
    "Intéressé",
    "Publié",
    "Refusé",
  ];

  const colonnes = Object.fromEntries(
    statuses.map((status) => [
      status,
      medias.filter((m) =>
        status === "À contacter"
          ? !m.statut || m.statut === "À contacter"
          : m.statut === status
      ),
    ])
  );

  async function onDragEnd(result: any) {
    if (!result.destination) return;

    const mediaId = result.draggableId;
    const newStatus = result.destination.droppableId;

    const { error } = await supabase
      .from("medias")
      .update({
        statut: newStatus,
      })
      .eq("id", mediaId);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-6">
        {Object.entries(colonnes).map(([colonne, items]: any) => (
          <Droppable droppableId={colonne} key={colonne}>
            {(provided) => (
              <section
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="min-h-[600px] rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {colonne}
                  </h2>

                  <span className="text-sm text-zinc-500">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {items.map((media: any, index: number) => (
                    <Draggable
                      draggableId={media.id}
                      index={index}
                      key={media.id}
                    >
                      {(provided) => (
                        <Link
                          href={`/medias/${media.id}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 hover:border-zinc-600"
                        >
                          <h3 className="font-semibold">
                            {media.nom}
                          </h3>

                          <div className="mt-3 space-y-1 text-sm text-zinc-400">
                            <p>{media.type}</p>
                            <p>{media.plateforme || "-"}</p>
                            <p>
                              {media.artistes?.nom || "Aucun artiste"}
                            </p>
                          </div>
                        </Link>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              </section>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}