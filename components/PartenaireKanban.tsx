"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { notifyRoles } from "@/lib/notify";

const statuses = [
  "À contacter",
  "Contacté",
  "Relancé",
  "Intéressé",
  "Collaboration",
  "Partenaire actif",
  "Refusé",
];

export default function PartenaireKanban({
  partenaires,
}: {
  partenaires: any[];
}) {
  const [localPartenaires, setLocalPartenaires] = useState<any[]>(
    partenaires || []
  );

  useEffect(() => {
    setLocalPartenaires(partenaires || []);
  }, [partenaires]);

  const colonnes = Object.fromEntries(
    statuses.map((status) => [
      status,
      localPartenaires.filter(
        (item) => (item.statut?.trim() || "À contacter") === status
      ),
    ])
  );

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;

    const partenaireId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const previousPartenaires = localPartenaires;

    const partenaire = localPartenaires.find(
      (item) => item.id === partenaireId
    );

    if (!partenaire || partenaire.statut === newStatus) return;

    const nextRelance =
      newStatus === "Relancé"
        ? new Date().toISOString().split("T")[0]
        : null;

    setLocalPartenaires((current) =>
      current.map((item) =>
        item.id === partenaireId
          ? { ...item, statut: newStatus, prochaine_relance: nextRelance }
          : item
      )
    );

    const { error } = await supabaseBrowser
      .from("partenaires")
      .update({
        statut: newStatus,
        prochaine_relance: nextRelance,
      })
      .eq("id", partenaireId);

    if (error) {
      setLocalPartenaires(previousPartenaires);
      alert(error.message);
      return;
    }

    if (newStatus === "Partenaire actif") {
      await supabaseBrowser.from("activity_logs").insert({
        type: "Partenaire",
        titre: "Nouveau partenaire actif",
        description: `${partenaire.nom} est passé en partenaire actif`,
      });

      await notifyRoles({
        roles: ["super_admin", "manager"],
        type: "Partenaire",
        titre: "Nouveau partenaire actif",
        description: `${partenaire.nom} est passé en partenaire actif`,
        link: `/partenaires/${partenaireId}`,
      });
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-7">
        {Object.entries(colonnes).map(([colonne, items]: any) => (
          <Droppable droppableId={colonne} key={colonne}>
            {(provided, snapshot) => (
              <section
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[600px] rounded-2xl border p-5 transition ${
                  snapshot.isDraggingOver
                    ? "border-white bg-zinc-800"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{colonne}</h2>
                  <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {items.map((partenaire: any, index: number) => (
                    <Draggable
                      draggableId={partenaire.id}
                      index={index}
                      key={partenaire.id}
                    >
                      {(provided, snapshot) => (
                        <Link
                          href={`/partenaires/${partenaire.id}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-600 ${
                            snapshot.isDragging
                              ? "scale-[1.02] border-white shadow-2xl"
                              : ""
                          }`}
                        >
                          <h3 className="font-semibold">
                            {partenaire.nom}
                          </h3>

                          <div className="mt-3 space-y-1 text-sm text-zinc-400">
                            <p>{partenaire.type}</p>
                            <p>{partenaire.ville || "Ville non renseignée"}</p>
                            <p>
                              Tarif :{" "}
                              {Number(partenaire.tarif || 0).toFixed(2)} €
                            </p>
                            <p>{partenaire.statut || "À contacter"}</p>
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