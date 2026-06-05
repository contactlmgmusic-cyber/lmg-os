"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Props = {
  table: string;
  id: string;
  title: string;
  redirectTo: string;
};

export default function DeletePage({
  table,
  id,
  title,
  redirectTo,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const { error } = await supabaseBrowser
      .from(table)
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-10 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-red-500/20 bg-zinc-900 p-8">
        <h1 className="text-3xl font-bold text-red-400">
          {title}
        </h1>

        <p className="mt-4 text-zinc-400">
          Cette action est irréversible.
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleDelete}
            className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700"
          >
            Oui, supprimer
          </button>

          <button
            onClick={() => router.back()}
            className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
          >
            Annuler
          </button>
        </div>
      </div>
    </main>
  );
}