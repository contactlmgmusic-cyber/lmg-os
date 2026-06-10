"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function ConvertCandidatureButton({
  candidature,
}: {
  candidature: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function convert() {
    if (!candidature.nom_artiste) {
      alert("Nom artiste manquant.");
      return;
    }

    setLoading(true);

    const { data: artiste, error } = await supabaseBrowser
      .from("artistes")
      .insert({
        nom: candidature.nom_artiste,
        instagram: candidature.instagram || "",
        style: candidature.style || "",
        statut: "Signé",
        bio:
          candidature.message ||
          candidature.notes_internes ||
          candidature.note_interne ||
          "",
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (!artiste) {
      alert("Erreur lors de la création de l’artiste.");
      setLoading(false);
      return;
    }

    const slug = slugify(artiste.nom);

    await supabaseBrowser.from("chat_channels").insert({
      name: artiste.nom,
      slug: `artiste-${slug}`,
      type: "artiste",
      artiste_id: artiste.id,
    });

    await supabaseBrowser
      .from("candidatures")
      .update({
        statut: "Signé",
      })
      .eq("id", candidature.id);

    const { data: admins } = await supabaseBrowser
      .from("profiles")
      .select("id")
      .in("role", ["super_admin", "admin", "manager"]);

    if (admins && admins.length > 0) {
      await supabaseBrowser.from("notifications").insert(
        admins.map((admin) => ({
          user_id: admin.id,
          type: "artiste",
          titre: "Candidature convertie en artiste",
          description: artiste.nom,
          link: `/artistes/${artiste.id}`,
        }))
      );
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Artiste",
      titre: "Candidature convertie",
      description: artiste.nom,
    });

    router.push(`/artistes/${artiste.id}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={convert}
      disabled={loading}
      className="w-full rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-4 text-center font-semibold text-green-300 hover:bg-green-500/20 disabled:opacity-50"
    >
      {loading ? "Conversion..." : "Confirmer la conversion en artiste"}
    </button>
  );
}