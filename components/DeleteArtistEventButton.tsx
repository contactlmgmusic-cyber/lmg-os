"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function DeleteArtistEventButton({
  eventId,
}: {
  eventId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;

    const confirmed = window.confirm(
      "Supprimer cet événement artiste ?"
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabaseBrowser.auth.getUser();

      if (userError || !user) {
        alert("Vous devez être connecté.");
        window.location.href = "/login";
        return;
      }

      const { data: profile, error: profileError } =
        await supabaseBrowser
          .from("profiles")
          .select("id, role")
          .eq("id", user.id)
          .single();

      if (profileError || !profile) {
        alert("Profil utilisateur introuvable.");
        return;
      }

      const allowedRoles = [
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.ARTISTIC_DIRECTOR,
        ROLES.MANAGER,
      ];

      if (!allowedRoles.includes(profile.role)) {
        alert("Accès refusé.");
        return;
      }

      const { data: event, error: eventError } =
        await supabaseBrowser
          .from("artiste_events")
          .select("id, artiste_id")
          .eq("id", eventId)
          .maybeSingle();

      if (eventError) {
        alert(eventError.message);
        return;
      }

      if (!event) {
        alert("Événement introuvable.");
        return;
      }

      if (profile.role === ROLES.MANAGER) {
        const { data: artiste, error: artisteError } =
          await supabaseBrowser
            .from("artistes")
            .select("id")
            .eq("id", event.artiste_id)
            .eq("manager_id", profile.id)
            .maybeSingle();

        if (artisteError) {
          alert(artisteError.message);
          return;
        }

        if (!artiste) {
          alert(
            "Vous ne pouvez supprimer que les événements de vos artistes."
          );
          return;
        }
      }

      const { error: deleteError } = await supabaseBrowser
        .from("artiste_events")
        .delete()
        .eq("id", eventId);

      if (deleteError) {
        alert(deleteError.message);
        return;
      }

      router.push("/artiste-events");
      router.refresh();
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de l’événement :",
        error
      );

      alert(
        "Une erreur inattendue est survenue pendant la suppression."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      disabled={deleting}
      onClick={handleDelete}
      className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting ? "Suppression..." : "Supprimer"}
    </button>
  );
}