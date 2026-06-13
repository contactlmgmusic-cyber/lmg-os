"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { notifyRoles } from "@/lib/notify";
import { ROLES } from "@/lib/roles";

export default function NotificationsIntelligentesPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        profile?.role !== ROLES.SUPER_ADMIN &&
        profile?.role !== ROLES.ADMIN
      ) {
        window.location.href = "/";
        return;
      }
    }

    checkAccess();
  }, []);

  async function lancerAnalyse() {
    setLoading(true);
    setMessage("");

    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const in7DaysString = in7Days.toISOString().split("T")[0];

    let totalAlerts = 0;

    const { data: objectifs } = await supabaseBrowser
      .from("objectifs_artistes")
      .select(`
        *,
        artistes ( id, nom )
      `);

    const { data: analytics } = await supabaseBrowser
      .from("analytics")
      .select("*");

    for (const objectif of objectifs || []) {
      const artisteId = objectif.artiste_id;

      let actuel = Number(objectif.actuel || 0);

      if (objectif.type === "Streams") {
        actuel =
          analytics
            ?.filter((item: any) => item.artiste_id === artisteId)
            .reduce(
              (acc: number, item: any) => acc + Number(item.streams || 0),
              0
            ) || 0;
      }

      if (objectif.type === "Followers") {
        actuel =
          analytics
            ?.filter((item: any) => item.artiste_id === artisteId)
            .reduce(
              (acc: number, item: any) => acc + Number(item.followers || 0),
              0
            ) || 0;
      }

      if (objectif.type === "Vues") {
        actuel =
          analytics
            ?.filter((item: any) => item.artiste_id === artisteId)
            .reduce(
              (acc: number, item: any) => acc + Number(item.vues || 0),
              0
            ) || 0;
      }

      if (actuel >= Number(objectif.objectif || 0) && Number(objectif.objectif || 0) > 0) {
        await supabaseBrowser.from("activity_logs").insert({
          type: "Objectif",
          titre: "Objectif artiste atteint",
          description: `${objectif.artistes?.nom || "Un artiste"} a atteint son objectif ${objectif.type}`,
          artiste_id: artisteId,
        });

        await notifyRoles({
          roles: ["super_admin", "admin", "manager"],
          type: "Objectif",
          titre: "Objectif artiste atteint",
          description: `${objectif.artistes?.nom || "Un artiste"} • ${objectif.type} atteint`,
          link: `/artistes/${artisteId}`,
        });

        totalAlerts++;
      }
    }

    const { data: sorties } = await supabaseBrowser
      .from("sorties")
      .select("*")
      .gte("date_sortie", todayString)
      .lte("date_sortie", in7DaysString);

    for (const sortie of sorties || []) {
      await supabaseBrowser.from("activity_logs").insert({
        type: "Sortie",
        titre: "Sortie proche",
        description: `${sortie.titre} sort dans moins de 7 jours`,
        artiste_id: sortie.artiste_id,
      });

      await notifyRoles({
        roles: ["super_admin", "admin", "manager"],
        type: "Sortie",
        titre: "Sortie proche",
        description: `${sortie.titre} • J-7`,
        link: `/sorties/${sortie.id}`,
      });

      totalAlerts++;
    }

    const { data: contrats } = await supabaseBrowser
      .from("contrats")
      .select("*")
      .neq("statut", "Signé");

    for (const contrat of contrats || []) {
      await supabaseBrowser.from("activity_logs").insert({
        type: "Contrat",
        titre: "Contrat non signé",
        description: `${contrat.titre} est toujours en attente de signature`,
        artiste_id: contrat.artiste_id,
      });

      await notifyRoles({
        roles: ["super_admin", "admin"],
        type: "Contrat",
        titre: "Contrat non signé",
        description: contrat.titre,
        link: `/contrats/${contrat.id}`,
      });

      totalAlerts++;
    }

    const { data: royalties } = await supabaseBrowser
      .from("royalties")
      .select("*")
      .neq("statut", "Payé");

    if (royalties && royalties.length > 0) {
      await supabaseBrowser.from("activity_logs").insert({
        type: "Royalties",
        titre: "Royalties à payer",
        description: `${royalties.length} ligne(s) de royalties sont en attente`,
      });

      await notifyRoles({
        roles: ["super_admin", "admin"],
        type: "Royalties",
        titre: "Royalties à payer",
        description: `${royalties.length} paiement(s) en attente`,
        link: "/royalties",
      });

      totalAlerts++;
    }

    setMessage(`${totalAlerts} alerte(s) intelligente(s) générée(s).`);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Smart Alerts
        </p>

        <h1 className="text-5xl font-bold">Notifications intelligentes</h1>

        <p className="mt-3 text-zinc-400">
          Analyse les objectifs, sorties, contrats et royalties pour générer des alertes.
        </p>
      </div>

      <button
        onClick={lancerAnalyse}
        disabled={loading}
        className="rounded-xl bg-white px-6 py-4 font-semibold text-black disabled:opacity-50"
      >
        {loading ? "Analyse en cours..." : "Lancer l’analyse intelligente"}
      </button>

      {message && (
        <p className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-300">
          {message}
        </p>
      )}
    </main>
  );
}