"use client";

import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { notifyRoles } from "@/lib/notify";

const statuses = [
  "À contacter",
  "Contacté",
  "Relancé",
  "Intéressé",
  "Campagne lancée",
  "Publié",
  "Refusé",
];

const statusStyles: Record<string, string> = {
  "À contacter": "border-zinc-700 bg-zinc-950 text-zinc-300",
  Contacté: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Relancé: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  Intéressé: "border-green-500/40 bg-green-500/10 text-green-300",
  "Campagne lancée": "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Publié: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  Refusé: "border-red-500/40 bg-red-500/10 text-red-300",
};

function formatNumber(value?: number | null) {
  return Number(value || 0).toLocaleString("fr-FR");
}

function getRelanceInfo(date?: string | null) {
  if (!date) return null;

  const today = new Date();
  const relance = new Date(date);

  today.setHours(0, 0, 0, 0);
  relance.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (relance.getTime() - today.getTime()) / 86400000
  );

  if (diff < 0) {
    return {
      label: `Relance en retard de ${Math.abs(diff)}j`,
      className: "text-red-300",
    };
  }

  if (diff === 0) {
    return {
      label: "Relance aujourd’hui",
      className: "text-orange-300",
    };
  }

  if (diff <= 7) {
    return {
      label: `Relance J-${diff}`,
      className: "text-yellow-300",
    };
  }

  return {
    label: `Relance J-${diff}`,
    className: "text-zinc-500",
  };
}

export default function InfluenceurKanban({
  influenceurs,
}: {
  influenceurs: any[];
}) {
  const router = useRouter();

  const colonnes = Object.fromEntries(
  statuses.map((status) => [
    status,
    influenceurs.filter((item) => {
      const itemStatus = item.statut?.trim() || "À contacter";

      if (status === "À contacter") {
        return !statuses.includes(itemStatus) || itemStatus === "À contacter";
      }

      return itemStatus === status;
    }),
  ])
);

  async function onDragEnd(result: DropResult) {
  if (!result.destination) return;

  const influenceurId = result.draggableId;
  const newStatus = result.destination.droppableId;

  const influenceur = influenceurs.find(
    (item) => item.id === influenceurId
  );

  const { error } = await supabaseBrowser
    .from("influenceurs")
    .update({
      statut: newStatus,
      prochaine_relance:
        newStatus === "Relancé"
          ? new Date().toISOString().split("T")[0]
          : null,
    })
    .eq("id", influenceurId);

  if (error) {
    alert(error.message);
    return;
  }

  if (newStatus === "Publié") {
    await supabaseBrowser.from("activity_logs").insert({
      type: "Influenceur",
      titre: "Publication influenceur obtenue",
      description: `${influenceur?.nom || "Un influenceur"} est passé en statut Publié`,
    });

    await notifyRoles({
      roles: ["super_admin", "manager"],
      type: "Influenceur",
      titre: "Publication influenceur obtenue",
      description: `${influenceur?.nom || "Un influenceur"} est passé en statut Publié`,
      link: `/influenceurs/${influenceurId}`,
    });
  }

  router.refresh();
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

                  <span
                    className={`rounded-full border px-2 py-1 text-xs ${
                      statusStyles[colonne] ||
                      "border-zinc-700 bg-zinc-950 text-zinc-300"
                    }`}
                  >
                    {items.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {items.map((influenceur: any, index: number) => {
                    const relanceInfo = getRelanceInfo(
                      influenceur.prochaine_relance
                    );

                    return (
                      <Draggable
                        draggableId={influenceur.id}
                        index={index}
                        key={influenceur.id}
                      >
                        {(provided, snapshot) => (
                          <Link
                            href={`/influenceurs/${influenceur.id}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-600 ${
                              snapshot.isDragging
                                ? "scale-[1.02] border-white shadow-2xl"
                                : ""
                            }`}
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold">
                                  {influenceur.nom || "Influenceur sans nom"}
                                </h3>

                                <p className="mt-1 text-xs text-zinc-500">
                                  {influenceur.plateforme || "Plateforme"}
                                  {influenceur.pseudo
                                    ? ` · ${influenceur.pseudo}`
                                    : ""}
                                </p>
                              </div>

                              <span
                                className={`rounded-full border px-2 py-1 text-[10px] ${
                                  statusStyles[colonne] ||
                                  "border-zinc-700 text-zinc-300"
                                }`}
                              >
                                {influenceur.statut || "À contacter"}
                              </span>
                            </div>

                            <div className="space-y-1 text-sm text-zinc-400">
                              <p>Audience : {formatNumber(influenceur.audience)}</p>
                              <p>Tarif : {Number(influenceur.tarif || 0).toFixed(2)} €</p>

                              {influenceur.categorie && (
                                <p>Catégorie : {influenceur.categorie}</p>
                              )}

                              {influenceur.artistes?.nom && (
                                <p>Artiste : {influenceur.artistes.nom}</p>
                              )}

                              {influenceur.projets?.titre && (
                                <p>Projet : {influenceur.projets.titre}</p>
                              )}

                              {relanceInfo && (
                                <p className={`pt-2 text-xs ${relanceInfo.className}`}>
                                  {relanceInfo.label}
                                </p>
                              )}
                            </div>
                          </Link>
                        )}
                      </Draggable>
                    );
                  })}

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