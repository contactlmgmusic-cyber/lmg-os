"use client";

import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

const statuses = [
  "Prospect",
  "Contacté",
  "Relance",
  "Négociation",
  "Confirmé",
  "Facturé",
  "Refusé",
];

function normalizeStatus(status?: string | null) {
  if (!status) return "Prospect";

  if (status === "Relancé") return "Relance";
  if (status === "En négociation") return "Négociation";
  if (status === "Payé") return "Facturé";

  return status;
}

export default function BookingKanban({
  bookings,
}: {
  bookings: any[];
}) {
  const router = useRouter();

  const colonnes = Object.fromEntries(
    statuses.map((status) => [
      status,
      bookings.filter(
        (booking) => normalizeStatus(booking.statut) === status
      ),
    ])
  );

  async function notifyAdminsOnConfirmed(booking: any) {
    const { data: admins } = await supabaseBrowser
      .from("profiles")
      .select("id")
      .in("role", ["super_admin", "admin"]);

    if (!admins || admins.length === 0) return;

    await supabaseBrowser.from("notifications").insert(
      admins.map((admin) => ({
        user_id: admin.id,
        type: "booking",
        titre: "Booking confirmé",
        description: booking.evenement || "Nouvelle date confirmée",
        link: `/booking/${booking.id}`,
      }))
    );
  }

  async function onDragEnd(result: any) {
    if (!result.destination) return;

    const bookingId = result.draggableId;
    const newStatus = result.destination.droppableId;

    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;

    const oldStatus = normalizeStatus(booking.statut);

    if (oldStatus === newStatus) return;

    const { error } = await supabaseBrowser
      .from("bookings")
      .update({
        statut: newStatus,
      })
      .eq("id", bookingId);

    if (error) {
      alert(error.message);
      return;
    }

    if (newStatus === "Confirmé") {
      await notifyAdminsOnConfirmed(booking);
    }

    router.refresh();
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-7">
        {Object.entries(colonnes).map(([colonne, items]: any) => {
          const totalCachet =
            items.reduce(
              (acc: number, booking: any) =>
                acc + Number(booking.cachet || 0),
              0
            ) || 0;

          return (
            <Droppable droppableId={colonne} key={colonne}>
              {(provided) => (
                <section
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[600px] rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="mb-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{colonne}</h2>

                      <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-400">
                        {items.length}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-zinc-500">
                      Total : {totalCachet.toFixed(2)} €
                    </p>
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
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <h3 className="font-semibold leading-snug">
                                {booking.evenement || "Événement"}
                              </h3>

                              {booking.cachet && (
                                <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-black">
                                  {Number(booking.cachet).toFixed(0)} €
                                </span>
                              )}
                            </div>

                            <div className="space-y-2 text-sm text-zinc-400">
                              <p>
                                {booking.artistes?.nom || "Artiste non lié"}
                              </p>

                              <p>
                                {booking.organisateur ||
                                  "Organisateur non renseigné"}
                              </p>

                              <p>
                                {booking.ville || "Ville non renseignée"}
                              </p>

                              <p>
                                {booking.date_event ||
                                  "Date non renseignée"}
                              </p>

                              {booking.prochaine_relance && (
                                <p className="text-yellow-300">
                                  Relance : {booking.prochaine_relance}
                                </p>
                              )}
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
          );
        })}
      </div>
    </DragDropContext>
  );
}