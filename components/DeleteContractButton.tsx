"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function DeleteContractButton({
  contratId,
}: {
  contratId: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const confirmDelete = confirm(
      "Tu es sûre de vouloir supprimer ce contrat ? Cette action est définitive."
    );

    if (!confirmDelete) return;

    const { error } = await supabaseBrowser
      .from("contrats")
      .delete()
      .eq("id", contratId);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/contrats");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="block w-full rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-center text-red-300 hover:bg-red-500/20"
    >
      Supprimer contrat
    </button>
  );
}