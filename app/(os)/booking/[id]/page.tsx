import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      artistes (
        id,
        nom,
        style,
        photo_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !booking) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Booking introuvable.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href="/booking" className="text-sm text-zinc-400 hover:text-white">
        ← Retour au booking
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Booking CRM
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            {booking.evenement}
          </h1>

          <span className="mt-6 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            {booking.statut || "Prospect"}
          </span>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Organisateur</p>
              <p className="mt-2 text-xl font-semibold">
                {booking.organisateur || "Non renseigné"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Ville</p>
              <p className="mt-2 text-xl font-semibold">
                {booking.ville || "Non renseignée"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Date événement</p>
              <p className="mt-2 text-xl font-semibold">
                {booking.date_event || "Non renseignée"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Cachet</p>
              <p className="mt-2 text-xl font-semibold">
                {booking.cachet ? `${booking.cachet} €` : "Non renseigné"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Contact</h2>
            <p className="mt-4 leading-relaxed text-zinc-400">
              {booking.contact || "Aucun contact renseigné."}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Notes</h2>
            <p className="mt-4 leading-relaxed text-zinc-400">
              {booking.notes || "Aucune note renseignée."}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Artiste lié</h2>

            {booking.artistes ? (
              <Link
                href={`/artistes/${booking.artistes.id}`}
                className="mt-6 block overflow-hidden rounded-2xl border border-zinc-800 bg-black hover:border-zinc-600"
              >
                <div className="h-56 bg-zinc-800">
                  {booking.artistes.photo_url ? (
                    <img
                      src={booking.artistes.photo_url}
                      alt={booking.artistes.nom}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-500">
                      Aucun visuel
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-bold">
                    {booking.artistes.nom}
                  </h3>
                  <p className="mt-1 text-zinc-500">
                    {booking.artistes.style || "Style non renseigné"}
                  </p>
                </div>
              </Link>
            ) : (
              <p className="mt-5 text-zinc-500">Aucun artiste lié.</p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Actions</h2>

            <div className="mt-6 space-y-3">
              <Link
                href="/booking"
                className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:bg-zinc-200"
              >
                Retour pipeline
              </Link>

              <Link
  href={`/booking/${booking.id}/modifier`}
  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
>
  Modifier booking
</Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}