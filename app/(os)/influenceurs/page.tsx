import Link from "next/link";
import { supabase } from "@/lib/supabase";
import InfluenceurKanban from "@/components/InfluenceurKanban";


export const dynamic = "force-dynamic";

export default async function InfluenceursPage() {
  const { data: influenceurs, error } = await supabase
  .from("influenceurs")
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
          <h1 className="text-5xl font-bold">CRM Influenceurs</h1>

          <p className="mt-3 text-zinc-400">
            Suivi des créateurs, campagnes, tarifs et publications.
          </p>
        </div>

        <Link
          href="/influenceurs/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
        >
          + Nouvel influenceur
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
  DEBUG influenceurs : {influenceurs?.length || 0}
</div>

      <InfluenceurKanban influenceurs={influenceurs || []} />
    </main>
  );
}