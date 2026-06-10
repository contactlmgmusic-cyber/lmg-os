import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";
import BookingKanban from "@/components/BookingKanban";
import { ROLES } from "@/lib/roles";

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

  if (currentProfile?.role === ROLES.MANAGER && user?.id) {
  const { data: managedArtists } = await supabase
    .from("artistes")
    .select("id")
    .eq("manager_id", user.id);

  const managedArtistIds = managedArtists?.map((a: any) => a.id) || [];

  if (managedArtistIds.length === 0) {
    query = query.eq("id", "00000000-0000-0000-0000-000000000000");
  } else {
    query = query.in("artiste_id", managedArtistIds);
  }
}

if (currentProfile?.role === ROLES.ARTISTE && currentProfile.artiste_id) {
  query = query.eq("artiste_id", currentProfile.artiste_id);
}

if (currentProfile?.role === ROLES.PRESTATAIRE) {
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
    currentProfile?.role === ROLES.SUPER_ADMIN ||
    currentProfile?.role === ROLES.ADMIN ||
    currentProfile?.role === ROLES.MANAGER;

  return (
    <main className="p-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Booking CRM</h1>

          <p className="mt-2 text-zinc-400">
            {currentProfile?.role === ROLES.MANAGER
              ? "Bookings de mes artistes"
              : currentProfile?.role === ROLES.ARTISTE
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