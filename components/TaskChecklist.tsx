"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export default function TaskChecklist({
  taskId,
  initialItems,
}: {
  taskId: string;
  initialItems: ChecklistItem[];
}) {
  const [items, setItems] = useState(initialItems || []);
  const [newItem, setNewItem] = useState("");

  async function saveChecklist(updatedItems: ChecklistItem[]) {
    setItems(updatedItems);

    const { error } = await supabaseBrowser
      .from("taches")
      .update({ checklist: updatedItems })
      .eq("id", taskId);

    if (error) alert(error.message);
  }

  function addItem() {
    if (!newItem.trim()) return;

    const updatedItems = [
      ...items,
      {
        id: crypto.randomUUID(),
        text: newItem,
        done: false,
      },
    ];

    setNewItem("");
    saveChecklist(updatedItems);
  }

  function toggleItem(id: string) {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );

    saveChecklist(updatedItems);
  }

  function deleteItem(id: string) {
    const updatedItems = items.filter((item) => item.id !== id);
    saveChecklist(updatedItems);
  }

  return (
    <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
      <h2 className="text-2xl font-bold">Checklist</h2>

      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-zinc-500">
            Aucune étape pour le moment.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3"
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item.id)}
              />

              <span
                className={
                  item.done
                    ? "text-zinc-500 line-through"
                    : "text-white"
                }
              >
                {item.text}
              </span>
            </label>

            <button
              type="button"
              onClick={() => deleteItem(item.id)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Ajouter une étape..."
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white"
        />

        <button
          type="button"
          onClick={addItem}
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}