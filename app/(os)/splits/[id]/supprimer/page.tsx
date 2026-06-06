"use client";

import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useState } from "react";

export default function SupprimerSplitPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const { error } = await supabaseBrowser
      .from("splits")
      .delete()
      .eq("id", params.id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/splits");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-red-500/30 bg-zinc-900 p-8">
        <h1 className="text-4xl font-bold text-red-400">
          Supprimer le split sheet
        </h1>

        <p className="mt-4 text-zinc-400">
          Cette action est définitive. Tous les participants liés seront également supprimés.
        </p>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-red-500 px-5 py-4 font-medium text-white hover:bg-red-600 disabled:opacity-50"
        >
          {loading
            ? "Suppression..."
            : "Confirmer la suppression"}
        </button>
      </div>
    </main>
  );
}