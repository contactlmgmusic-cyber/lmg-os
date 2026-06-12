import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PartenaireKanban from "@/components/PartenaireKanban";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function PartenairesPage() {
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

if (!user) redirect("/login");

const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (
  profile?.role !== ROLES.SUPER_ADMIN &&
  profile?.role !== ROLES.ADMIN
) {
  redirect("/");
}

  const { data: partenaires, error } = await supabase
    .from("partenaires")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold">CRM Partenaires</h1>

          <p className="mt-3 text-zinc-400">
            Beatmakers, studios, photographes, réalisateurs, labels, distributeurs et partenaires LMG.
          </p>
        </div>

        <Link
          href="/partenaires/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
        >
          + Nouveau partenaire
        </Link>
      </div>

      <PartenaireKanban partenaires={partenaires || []} />
    </main>
  );
}