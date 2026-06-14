"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function DeleteArtistEventButton({
  eventId,
}: {
  eventId: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Supprimer cet événement artiste ?")) return;

    const { error } = await supabaseBrowser
      .from("artiste_events")
      .delete()
      .eq("id", eventId);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/artiste-events");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-red-300 hover:bg-red-500/20"
    >
      Supprimer
    </button>
  );
}