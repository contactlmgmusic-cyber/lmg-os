"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TaskStatusButton({
  id,
  statut,
}: {
  id: string;
  statut: string | null;
}) {
  const router = useRouter();

  const nextStatut =
    statut === "À faire"
      ? "En cours"
      : statut === "En cours"
      ? "Terminé"
      : "À faire";

  async function updateStatus() {
    const { error } = await supabase
      .from("taches")
      .update({ statut: nextStatut })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={updateStatus}
      className="mt-4 w-full rounded-xl bg-white text-black px-4 py-3 text-sm font-semibold hover:bg-zinc-200 transition"
    >
      Passer en {nextStatut}
    </button>
  );
}