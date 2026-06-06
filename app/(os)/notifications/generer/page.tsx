"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function GenererNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function generateNotifications() {
    setLoading(true);
    setMessage("");

    const { data: admins } = await supabaseBrowser
      .from("profiles")
      .select("id")
      .in("role", ["super_admin", "admin"]);

    const adminIds = admins?.map((admin) => admin.id) || [];

    if (adminIds.length === 0) {
      setMessage("Aucun admin trouvé.");
      setLoading(false);
      return;
    }

    const notifications: any[] = [];

    const { data: contrats } = await supabaseBrowser
      .from("contrats")
      .select("id, titre, statut")
      .neq("statut", "Signé");

    contrats?.forEach((contrat) => {
      adminIds.forEach((userId) => {
        notifications.push({
          user_id: userId,
          type: "contract",
          titre: "Contrat à signer",
          description: contrat.titre,
          link: `/contrats/${contrat.id}`,
          source_type: "contrat",
          source_id: contrat.id,
        });
      });
    });

    const { data: bookings } = await supabaseBrowser
      .from("bookings")
      .select("id, evenement, prochaine_relance")
      .not("prochaine_relance", "is", null);

    bookings?.forEach((booking) => {
      adminIds.forEach((userId) => {
        notifications.push({
          user_id: userId,
          type: "booking",
          titre: "Booking à relancer",
          description: booking.evenement,
          link: `/booking/${booking.id}`,
          source_type: "booking",
          source_id: booking.id,
        });
      });
    });

    const today = new Date();
    const inSevenDays = new Date();
    inSevenDays.setDate(today.getDate() + 7);

    const { data: projets } = await supabaseBrowser
      .from("projets")
      .select("id, titre, date_sortie")
      .not("date_sortie", "is", null);

    projets
      ?.filter((projet) => {
        const date = new Date(projet.date_sortie);
        return date >= today && date <= inSevenDays;
      })
      .forEach((projet) => {
        adminIds.forEach((userId) => {
          notifications.push({
            user_id: userId,
            type: "project",
            titre: "Sortie dans moins de 7 jours",
            description: projet.titre,
            link: `/projets/${projet.id}`,
            source_type: "projet",
            source_id: projet.id,
          });
        });
      });

    const { data: medias } = await supabaseBrowser
      .from("medias")
      .select("id, nom, statut")
      .eq("statut", "Relancé");

    medias?.forEach((media) => {
      adminIds.forEach((userId) => {
        notifications.push({
          user_id: userId,
          type: "media",
          titre: "Média à suivre",
          description: media.nom,
          link: `/medias/${media.id}`,
          source_type: "media",
          source_id: media.id,
        });
      });
    });

    if (notifications.length === 0) {
      setMessage("Aucune notification à créer.");
      setLoading(false);
      return;
    }

    const { error } = await supabaseBrowser
      .from("notifications")
      .upsert(notifications, {
        onConflict: "user_id,source_type,source_id,type",
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(`${notifications.length} notifications générées.`);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Générer notifications</h1>

        <p className="mt-3 text-zinc-400">
          Crée automatiquement les alertes utiles pour contrats, bookings, sorties et médias.
        </p>
      </div>

      <button
        onClick={generateNotifications}
        disabled={loading}
        className="rounded-xl bg-white px-6 py-4 font-medium text-black disabled:opacity-50"
      >
        {loading ? "Génération..." : "Générer les notifications"}
      </button>

      {message && (
        <p className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-300">
          {message}
        </p>
      )}
    </main>
  );
}