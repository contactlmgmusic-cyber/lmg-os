import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import InfluenceurKanban from "@/components/InfluenceurKanban";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function InfluenceursPage() {
  const cookieStore = await cookies();

  const profile = await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.ARTISTIC_DIRECTOR,
    ROLES.MANAGER,
  ]);

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

  const isManager =
    profile.role === ROLES.MANAGER;

  let influenceursQuery = supabase
    .from("influenceurs")
    .select(
      isManager
        ? `
          *,
          artistes!inner (
            id,
            manager_id
          )
        `
        : "*"
    )
    .order("created_at", {
      ascending: false,
    });

  if (isManager) {
    influenceursQuery =
      influenceursQuery.eq(
        "artistes.manager_id",
        profile.id
      );
  }

  const {
    data: influenceurs,
    error,
  } = await influenceursQuery;

  if (error) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">
          Impossible de charger les influenceurs.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold">
            CRM Influenceurs
          </h1>

          <p className="mt-3 text-zinc-400">
            {isManager
              ? "Influenceurs liés à mes artistes."
              : "Suivi des créateurs, campagnes, tarifs et publications."}
          </p>
        </div>

        <Link
          href="/influenceurs/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
        >
          + Nouvel influenceur
        </Link>
      </div>

      <InfluenceurKanban
        influenceurs={influenceurs || []}
      />
    </main>
  );
}