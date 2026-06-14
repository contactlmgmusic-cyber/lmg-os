"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type ChecklistItem = {
  texte: string;
  done: boolean;
};

export default function ChecklistEditor({
  tacheId,
  initialChecklist,
}: {
  tacheId: string;
  initialChecklist: ChecklistItem[];
}) {
  const [items, setItems] = useState<ChecklistItem[]>(initialChecklist || []);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveChecklist(nextItems: ChecklistItem[]) {
    setSaving(true);
    setItems(nextItems);

    const { error } = await supabaseBrowser
      .from("taches")
      .update({ checklist: nextItems })
      .eq("id", tacheId);

    setSaving(false);

    if (error) {
      alert(error.message);
    }

await supabaseBrowser.from("task_activity_logs").insert({
  task_id: tacheId,
  type: "checklist",
  message: "A mis à jour la checklist",
});

  }
  

  async function addItem() {
    if (!newItem.trim()) return;

    const nextItems = [
      ...items,
      {
        texte: newItem.trim(),
        done: false,
      },
    ];

    setNewItem("");
    await saveChecklist(nextItems);
  }

  async function toggleItem(index: number) {
    const nextItems = items.map((item, i) =>
      i === index ? { ...item, done: !item.done } : item
    );

    await saveChecklist(nextItems);
  }

  async function deleteItem(index: number) {
    const nextItems = items.filter((_, i) => i !== index);
    await saveChecklist(nextItems);
  }
  
 return (
    <div className="mt-8 rounded-2xl bg-black p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">ChecklistEditor chargé</h2>

        {saving && <p className="text-xs text-zinc-500">Sauvegarde...</p>}
      </div>

      <div className="mb-5 flex gap-3">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Ajouter une étape..."
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white"
        />

        <button
          type="button"
          onClick={addItem}
          className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black hover:bg-zinc-200"
        >
          Ajouter
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-zinc-500">
          Aucune checklist pour cette tâche.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <button
              type="button"
              onClick={() => toggleItem(index)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <div
                className={`h-4 w-4 rounded-full border ${
                  item.done
                    ? "border-green-400 bg-green-400"
                    : "border-zinc-600"
                }`}
              />

              <p
                className={`text-sm ${
                  item.done ? "text-zinc-500 line-through" : "text-white"
                }`}
              >
                {item.texte}
              </p>
            </button>

            <button
              type="button"
              onClick={() => deleteItem(index)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}