import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PartenaireKanban from "@/components/PartenaireKanban";

export const dynamic = "force-dynamic";

export default async function PartenairesPage() {
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