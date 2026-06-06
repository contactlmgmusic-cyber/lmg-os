import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";
import BookingKanban from "@/components/BookingKanban";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const cookieStore = await cookies();

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  const { data: currentProfile } = user
    ? await supabase
        .from("profiles")
        .select("role, artiste_id")
        .eq("id", user.id)
        .single()
    : { data: null };

  let query = supabase
    .from("bookings")
    .select(`
      *,
      artistes (
        id,
        nom,
        manager_id
      )
    `)
    .order("created_at", { ascending: false });

  if (currentProfile?.role === "manager") {
    query = query.eq("artistes.manager_id", user?.id);
  }

  if (currentProfile?.role === "artiste" && currentProfile?.artiste_id) {
    query = query.eq("artiste_id", currentProfile.artiste_id);
  }

  if (currentProfile?.role === "prestataire") {
    query = query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data: bookings, error } = await query;

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  const canCreateBooking =
    currentProfile?.role === "super_admin" ||
    currentProfile?.role === "admin" ||
    currentProfile?.role === "manager";

  return (
    <main className="p-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Booking CRM</h1>

          <p className="mt-2 text-zinc-400">
            {currentProfile?.role === "manager"
              ? "Bookings de mes artistes"
              : currentProfile?.role === "artiste"
              ? "Mes opportunités booking"
              : "Pipeline événements & festivals LMG"}
          </p>
        </div>

        {canCreateBooking && (
          <Link
            href="/booking/nouveau"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            + Nouveau booking
          </Link>
        )}
      </div>

      <BookingKanban bookings={bookings || []} />
    </main>
  );
}