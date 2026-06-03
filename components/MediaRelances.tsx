"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Relance = {
  id: string;
  type: string;
  contenu: string;
  date_relance: string;
  created_at: string;
};

export default function MediaRelances({
  mediaId,
  initialRelances,
}: {
  mediaId: string;
  initialRelances: Relance[];
}) {
  const [relances, setRelances] = useState<Relance[]>(initialRelances || []);
  const [type, setType] = useState("Note");
  const [contenu, setContenu] = useState("");
  const [saving, setSaving] = useState(false);

  async function addRelance() {
    if (!contenu.trim()) return;

    setSaving(true);

    const { data, error } = await supabaseBrowser
      .from("media_relances")
      .insert({
        media_id: mediaId,
        type,
        contenu: contenu.trim(),
      })
      .select("id, type, contenu, date_relance, created_at")
      .single();

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setRelances((current) => [data as Relance, ...current]);
    setContenu("");
  }

  async function deleteRelance(id: string) {
    if (!confirm("Supprimer cette relance ?")) return;

    const { error } = await supabaseBrowser
      .from("media_relances")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setRelances((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <h2 className="text-3xl font-bold">Historique des relances</h2>

      <div className="mt-6 space-y-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white"
        >
          <option>Note</option>
          <option>Email envoyé</option>
          <option>Relance</option>
          <option>Réponse reçue</option>
          <option>Publication obtenue</option>
          <option>Refus</option>
        </select>

        <textarea
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Ajouter une note de relance..."
          rows={4}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white"
        />

        <button
          type="button"
          onClick={addRelance}
          disabled={saving}
          className="w-full rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Ajout..." : "Ajouter à l'historique"}
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {relances.length === 0 && (
          <p className="text-zinc-500">Aucune relance enregistrée.</p>
        )}

        {relances.map((relance) => (
          <div
            key={relance.id}
            className="rounded-2xl border border-zinc-800 bg-black p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">
                  {new Date(relance.date_relance).toLocaleString("fr-FR")}
                </p>

                <h3 className="mt-1 text-lg font-semibold">
                  {relance.type}
                </h3>

                <p className="mt-3 leading-relaxed text-zinc-300">
                  {relance.contenu}
                </p>
              </div>

              <button
                type="button"
                onClick={() => deleteRelance(relance.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}