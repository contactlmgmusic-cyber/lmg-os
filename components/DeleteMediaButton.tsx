"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function DeleteMediaButton({ mediaId }: { mediaId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Tu es sûre de vouloir supprimer ce contact média ?")) return;

    const { error } = await supabaseBrowser
      .from("medias")
      .delete()
      .eq("id", mediaId);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/medias");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-center font-medium text-red-400 hover:bg-red-500/20"
    >
      Supprimer le contact
    </button>
  );
}