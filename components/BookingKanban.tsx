"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BookingKanban({
  bookings,
}: {
  bookings: any[];
}) {
  const router = useRouter();

  const colonnes = {
    Prospect: bookings.filter(
      (b) =>
        !b.statut ||
        b.statut === "Prospect"
    ),

    Contacté: bookings.filter(
      (b) => b.statut === "Contacté"
    ),

    "En négociation": bookings.filter(
      (b) => b.statut === "En négociation"
    ),

    Confirmé: bookings.filter(
      (b) => b.statut === "Confirmé"
    ),

    Payé: bookings.filter(
      (b) => b.statut === "Payé"
    ),
  };

  async function onDragEnd(result: any) {
    if (!result.destination) return;

    const bookingId = result.draggableId;
    const newStatus =
      result.destination.droppableId;

    const { error } = await supabase
      .from("bookings")
      .update({
        statut: newStatus,
      })
      .eq("id", bookingId);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

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

                    <h2 className="text-lg font-semibold">
                      {colonne}
                    </h2>

                    <span className="text-sm text-zinc-500">
                      {items.length}
                    </span>

                  </div>

                  <div className="space-y-4">

                    {items.map((booking, index) => (

                      <Draggable
                        draggableId={booking.id}
                        index={index}
                        key={booking.id}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"
                          >

                            <h3 className="font-semibold mb-2">
                              {booking.evenement}
                            </h3>

                            <div className="space-y-2 text-sm text-zinc-400">

                              <p>
                                {booking.organisateur ||
                                  "Organisateur"}
                              </p>

                              <p>
                                {booking.ville ||
                                  "Ville"}
                              </p>

                              <p>
                                {booking.date_event ||
                                  "Date"}
                              </p>

                              <p>
                                {booking.cachet
                                  ? `${booking.cachet} €`
                                  : "Cachet non renseigné"}
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