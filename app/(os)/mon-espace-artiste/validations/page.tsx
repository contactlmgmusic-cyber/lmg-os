"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function MesValidationsArtistePage() {
  const [validations, setValidations] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
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
      .from("artist_approvals")
      .select("*")
      .eq("artiste_id", profile.artiste_id)
      .order("created_at", { ascending: false });

    setValidations(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function respond(validation: any, statut: string) {
    const reponse = responses[validation.id] || "";

    const { error } = await supabaseBrowser
      .from("artist_approvals")
      .update({
        statut,
        reponse_artiste: reponse || null,
        responded_at: new Date().toISOString(),
      })
      .eq("id", validation.id);

    if (error) {
      alert(error.message);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Validation artiste",
      titre: `Validation ${statut}`,
      description: `${validation.type} • ${validation.titre}`,
      artiste_id: validation.artiste_id,
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

        <h1 className="text-5xl font-bold">Mes validations</h1>

        <p className="mt-3 text-zinc-400">
          Valide, refuse ou demande une modification sur les éléments envoyés par LMG.
        </p>
      </div>

      <section className="space-y-5">
        {validations.length === 0 && (
          <p className="text-zinc-500">Aucune validation en attente.</p>
        )}

        {validations.map((validation) => (
          <div
            key={validation.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm text-blue-300">
                  {validation.type || "Validation"}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {validation.titre}
                </h2>

                {validation.description && (
                  <p className="mt-4 max-w-3xl text-zinc-400">
                    {validation.description}
                  </p>
                )}

                {validation.lien && (
                  <a
                    href={validation.lien}
                    className="mt-5 inline-block rounded-xl border border-zinc-700 px-5 py-3 text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    Ouvrir le lien →
                  </a>
                )}
              </div>

              <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                {validation.statut}
              </span>
            </div>

            {validation.statut === "En attente" && (
              <>
                <textarea
                  value={responses[validation.id] || ""}
                  onChange={(e) =>
                    setResponses((current) => ({
                      ...current,
                      [validation.id]: e.target.value,
                    }))
                  }
                  placeholder="Message optionnel à LMG..."
                  className="mt-6 min-h-28 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
                />

                <div className="mt-5 flex flex-col gap-3 md:flex-row">
                  <button
                    onClick={() => respond(validation, "Approuvé")}
                    className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
                  >
                    ✅ Approuver
                  </button>

                  <button
                    onClick={() => respond(validation, "Modification demandée")}
                    className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 font-semibold text-yellow-300 hover:bg-yellow-500/20"
                  >
                    🟠 Demander modification
                  </button>

                  <button
                    onClick={() => respond(validation, "Refusé")}
                    className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-semibold text-red-300 hover:bg-red-500/20"
                  >
                    ❌ Refuser
                  </button>
                </div>
              </>
            )}

            {validation.reponse_artiste && validation.statut !== "En attente" && (
              <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-5">
                <p className="text-sm text-zinc-500">Réponse artiste</p>
                <p className="mt-2 text-zinc-300">
                  {validation.reponse_artiste}
                </p>
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}