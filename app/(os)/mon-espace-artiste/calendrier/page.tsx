import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function CalendrierArtistePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
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
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, artiste_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== ROLES.ARTISTE) {
    redirect("/");
  }

  if (!profile.artiste_id) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Aucun artiste lié à ce compte.
      </main>
    );
  }

  const artisteId = profile.artiste_id;

  const { data: projets } = await supabase
    .from("projets")
    .select("id, titre, date_sortie, statut")
    .eq("artiste_id", artisteId);

  const projetIds = projets?.map((p: any) => p.id) || [];

  const { data: taches } =
    projetIds.length > 0
      ? await supabase
          .from("taches")
          .select("id, titre, deadline, statut")
          .in("projet_id", projetIds)
      : { data: [] };

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, evenement, date_event, ville, statut")
    .eq("artiste_id", artisteId);

  const { data: sorties } = await supabase
    .from("sorties")
    .select("id, titre, date_sortie, statut")
    .eq("artiste_id", artisteId);

  const events = [
    ...(projets || [])
      .filter((p: any) => p.date_sortie)
      .map((p: any) => ({
        id: p.id,
        type: "Projet",
        titre: p.titre,
        date: p.date_sortie,
        statut: p.statut,
        href: `/projets/${p.id}`,
      })),

    ...(sorties || [])
      .filter((s: any) => s.date_sortie)
      .map((s: any) => ({
        id: s.id,
        type: "Sortie",
        titre: s.titre,
        date: s.date_sortie,
        statut: s.statut,
        href: `/sorties/${s.id}`,
      })),

    ...(taches || [])
      .filter((t: any) => t.deadline)
      .map((t: any) => ({
        id: t.id,
        type: "Tâche",
        titre: t.titre,
        date: t.deadline,
        statut: t.statut,
        href: `/taches/${t.id}`,
      })),

    ...(bookings || [])
      .filter((b: any) => b.date_event)
      .map((b: any) => ({
        id: b.id,
        type: "Booking",
        titre: b.evenement,
        date: b.date_event,
        statut: b.statut,
        ville: b.ville,
        href: `/booking/${b.id}`,
      })),
  ].sort(
    (a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Mon espace artiste
        </p>

        <h1 className="text-5xl font-bold">Mon calendrier</h1>

        <p className="mt-3 text-zinc-400">
          Toutes tes dates importantes : sorties, tâches, projets et bookings.
        </p>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        {events.length === 0 && (
          <p className="text-zinc-500">Aucun événement à venir.</p>
        )}

        <div className="space-y-4">
          {events.map((event: any) => (
            <Link
              key={`${event.type}-${event.id}`}
              href={event.href}
              className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">{event.type}</p>

                  <h2 className="mt-1 text-2xl font-bold">{event.titre}</h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    {event.ville ? `${event.ville} • ` : ""}
                    {event.statut || "Statut non renseigné"}
                  </p>
                </div>

                <p className="text-right text-sm font-semibold text-zinc-300">
                  {event.date}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}