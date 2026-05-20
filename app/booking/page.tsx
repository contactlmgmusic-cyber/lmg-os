import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BookingKanban from "@/components/BookingKanban";

export default async function BookingPage() {
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">
          Erreur : {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="p-10 text-white">

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            Booking CRM
          </h1>

          <p className="text-zinc-400 mt-2">
            Pipeline événements & festivals LMG
          </p>
        </div>

        <Link
          href="/booking/nouveau"
          className="rounded-xl bg-white text-black px-5 py-3 font-semibold"
        >
          + Nouveau booking
        </Link>

      </div>

      <BookingKanban bookings={bookings || []} />

    </main>
  );
}