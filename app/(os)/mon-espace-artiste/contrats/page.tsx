"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function MesContratsArtistePage() {
  const [contrats, setContrats] = useState<any[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabaseBrowser
      .from("profiles")
      .select("role, artiste_id")
      .eq("id", user.id)
      .single();

    if (profile?.role !== ROLES.ARTISTE || !profile.artiste_id) {
      window.location.href = "/";
      return;
    }

    const { data } = await supabaseBrowser
      .from("contrats")
      .select(`
        *,
        contract_approvals (
          id,
          statut,
          commentaire_artiste,
          approved_at,
          rejected_at
        )
      `)
      .eq("artiste_id", profile.artiste_id)
      .order("created_at", { ascending: false });

    setContrats(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function respondContrat(contrat: any, statut: "Approuvé" | "Refusé") {
    const existingApproval = contrat.contract_approvals?.[0];
    const commentaire = comments[contrat.id] || "";

    if (existingApproval) {
      const { error } = await supabaseBrowser
        .from("contract_approvals")
        .update({
          statut,
          commentaire_artiste: commentaire || null,
          approved_at: statut === "Approuvé" ? new Date().toISOString() : null,
          rejected_at: statut === "Refusé" ? new Date().toISOString() : null,
        })
        .eq("id", existingApproval.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabaseBrowser
        .from("contract_approvals")
        .insert({
          contrat_id: contrat.id,
          artiste_id: contrat.artiste_id,
          statut,
          commentaire_artiste: commentaire || null,
          approved_at: statut === "Approuvé" ? new Date().toISOString() : null,
          rejected_at: statut === "Refusé" ? new Date().toISOString() : null,
        });

      if (error) {
        alert(error.message);
        return;
      }
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Contrat",
      titre: `Contrat ${statut}`,
      description: `${contrat.titre}`,
      artiste_id: contrat.artiste_id,
    });

    await loadData();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Mon espace artiste
        </p>

        <h1 className="text-5xl font-bold">Mes contrats</h1>

        <p className="mt-3 text-zinc-400">
          Consulte, télécharge et valide tes contrats LMG.
        </p>
      </div>

      <section className="space-y-5">
        {contrats.length === 0 && (
          <p className="text-zinc-500">Aucun contrat disponible.</p>
        )}

        {contrats.map((contrat) => {
          const approval = contrat.contract_approvals?.[0];

          return (
            <div
              key={contrat.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-sm text-blue-300">
                    {contrat.type || "Contrat"}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">{contrat.titre}</h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    Statut contrat : {contrat.statut || "Brouillon"}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Validation artiste : {approval?.statut || "En attente"}
                  </p>
                </div>

                <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                  {approval?.statut || "En attente"}
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row">
                {contrat.fichier_url && (
                  <a
                    href={contrat.fichier_url}
                    target="_blank"
                    className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-zinc-200"
                  >
                    Télécharger contrat
                  </a>
                )}

                {contrat.fichier_signe_url && (
                  <a
                    href={contrat.fichier_signe_url}
                    target="_blank"
                    className="rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-3 text-center font-semibold text-green-300 hover:bg-green-500/20"
                  >
                    Télécharger contrat signé
                  </a>
                )}
              </div>

              {approval?.statut !== "Approuvé" && (
                <>
                  <textarea
                    value={comments[contrat.id] || ""}
                    onChange={(e) =>
                      setComments((current) => ({
                        ...current,
                        [contrat.id]: e.target.value,
                      }))
                    }
                    placeholder="Commentaire optionnel..."
                    className="mt-6 min-h-28 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
                  />

                  <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <button
                      onClick={() => respondContrat(contrat, "Approuvé")}
                      className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
                    >
                      ✅ Approuver
                    </button>

                    <button
                      onClick={() => respondContrat(contrat, "Refusé")}
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-semibold text-red-300 hover:bg-red-500/20"
                    >
                      ❌ Refuser
                    </button>
                  </div>
                </>
              )}

              {approval?.commentaire_artiste && (
                <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-5">
                  <p className="text-sm text-zinc-500">Commentaire artiste</p>
                  <p className="mt-2 text-zinc-300">
                    {approval.commentaire_artiste}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}