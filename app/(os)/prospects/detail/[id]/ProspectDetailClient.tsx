"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const statuts = [
  "À contacter",
  "Contacté",
  "Relancé",
  "RDV prévu",
  "Négociation",
  "Signé",
  "Perdu",
];

const priorites = ["Basse", "Moyenne", "Haute"];

export default function ProspectDetailClient() {
  const params = useParams();
  const router = useRouter();

  const prospectId = params.id as string;

  const [prospect, setProspect] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const { data } = await supabaseBrowser
      .from("prospects_lmg")
      .select(`
        *,
        profiles (
          id,
          nom
        )
      `)
      .eq("id", prospectId)
      .single();

    setProspect(data);
    setLoading(false);
  }

  useEffect(() => {
    if (prospectId) {
      loadData();
    }
  }, [prospectId]);

  async function saveChanges() {
    setSaving(true);

    const { error } = await supabaseBrowser
      .from("prospects_lmg")
      .update({
        nom: prospect.nom,
        type: prospect.type,
        contact_nom: prospect.contact_nom,
        email: prospect.email,
        telephone: prospect.telephone,
        instagram: prospect.instagram,
        site_web: prospect.site_web,
        ville: prospect.ville,
        pays: prospect.pays,
        statut: prospect.statut,
        priorite: prospect.priorite,
        potentiel_revenu: prospect.potentiel_revenu,
        source: prospect.source,
        notes: prospect.notes,
        prochaine_relance: prospect.prochaine_relance,
      })
      .eq("id", prospectId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Prospect mis à jour");
  }

  async function deleteProspect() {
    if (!confirm("Supprimer ce prospect ?")) return;

    const { error } = await supabaseBrowser
      .from("prospects_lmg")
      .delete()
      .eq("id", prospectId);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/prospects");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  if (!prospect) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Prospect introuvable.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            CRM LMG
          </p>

          <h1 className="text-5xl font-bold">
            {prospect.nom}
          </h1>

          <p className="mt-3 text-zinc-400">
            {prospect.type}
          </p>
        </div>

        <button
          onClick={deleteProspect}
          className="rounded-xl border border-red-500/40 px-5 py-3 text-red-300 hover:bg-red-500/10"
        >
          Supprimer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <input
          value={prospect.nom || ""}
          onChange={(e) =>
            setProspect({ ...prospect, nom: e.target.value })
          }
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
        />

        <input
          value={prospect.contact_nom || ""}
          onChange={(e) =>
            setProspect({ ...prospect, contact_nom: e.target.value })
          }
          placeholder="Contact"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
        />

        <input
          value={prospect.email || ""}
          onChange={(e) =>
            setProspect({ ...prospect, email: e.target.value })
          }
          placeholder="Email"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
        />

        <input
          value={prospect.telephone || ""}
          onChange={(e) =>
            setProspect({ ...prospect, telephone: e.target.value })
          }
          placeholder="Téléphone"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
        />

        <input
          value={prospect.instagram || ""}
          onChange={(e) =>
            setProspect({ ...prospect, instagram: e.target.value })
          }
          placeholder="Instagram"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
        />

        <input
          value={prospect.site_web || ""}
          onChange={(e) =>
            setProspect({ ...prospect, site_web: e.target.value })
          }
          placeholder="Site web"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
        />

        <select
          value={prospect.statut}
          onChange={(e) =>
            setProspect({ ...prospect, statut: e.target.value })
          }
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
        >
          {statuts.map((statut) => (
            <option key={statut}>{statut}</option>
          ))}
        </select>

        <select
          value={prospect.priorite}
          onChange={(e) =>
            setProspect({ ...prospect, priorite: e.target.value })
          }
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
        >
          {priorites.map((priorite) => (
            <option key={priorite}>{priorite}</option>
          ))}
        </select>

        <input
          type="number"
          value={prospect.potentiel_revenu || 0}
          onChange={(e) =>
            setProspect({
              ...prospect,
              potentiel_revenu: Number(e.target.value),
            })
          }
          placeholder="Potentiel revenu"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
        />

        <input
          type="date"
          value={prospect.prochaine_relance || ""}
          onChange={(e) =>
            setProspect({
              ...prospect,
              prochaine_relance: e.target.value,
            })
          }
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
        />
      </div>

      <textarea
        value={prospect.notes || ""}
        onChange={(e) =>
          setProspect({ ...prospect, notes: e.target.value })
        }
        placeholder="Notes"
        className="mt-5 min-h-40 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
      />

      <button
        onClick={saveChanges}
        disabled={saving}
        className="mt-6 rounded-xl bg-white px-6 py-4 font-semibold text-black disabled:opacity-50"
      >
        {saving ? "Sauvegarde..." : "Enregistrer"}
      </button>
    </main>
  );
}