"use client";

import Link from "next/link";
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

  const statuses = [
    "Prospect",
    "Contacté",
    "Relancé",
    "En négociation",
    "Confirmé",
    "Payé",
    "Refusé",
  ];

  const colonnes = Object.fromEntries(
    statuses.map((status) => [
      status,
      bookings.filter((b) =>
        status === "Prospect"
          ? !b.statut || b.statut === "Prospect"
          : b.statut === status
      ),
    ])
  );

  async function onDragEnd(result: any) {
    if (!result.destination) return;

    const bookingId = result.draggableId;
    const newStatus = result.destination.droppableId;

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
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-7">
        {Object.entries(colonnes).map(([colonne, items]: any) => (
          <Droppable droppableId={colonne} key={colonne}>
            {(provided) => (
              <section
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="min-h-[600px] rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{colonne}</h2>

                  <span className="text-sm text-zinc-500">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {items.map((booking: any, index: number) => (
                    <Draggable
                      draggableId={booking.id}
                      index={index}
                      key={booking.id}
                    >
                      {(provided) => (
                        <Link
                          href={`/booking/${booking.id}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-600"
                        >
                          <h3 className="mb-2 font-semibold">
                            {booking.evenement}
                          </h3>

                          <div className="space-y-2 text-sm text-zinc-400">
                            <p>{booking.organisateur || "Organisateur"}</p>
                            <p>{booking.ville || "Ville"}</p>
                            <p>{booking.date_event || "Date"}</p>

                            <p>
                              {booking.cachet
                                ? `${booking.cachet} €`
                                : "Cachet non renseigné"}
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