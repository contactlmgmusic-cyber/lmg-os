"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Commentaire = {
  id: string;
  auteur: string | null;
  contenu: string | null;
  created_at: string;
};

export default function TaskComments({
  taskId,
  initialComments,
}: {
  taskId: string;
  initialComments: Commentaire[];
}) {
  const [comments, setComments] = useState(initialComments || []);
  const [content, setContent] = useState("");

  async function addComment() {
    if (!content.trim()) return;

    const { data, error } = await supabaseBrowser
      .from("commentaires_taches")
      .insert({
        tache_id: taskId,
        auteur: "Yli",
        contenu: content,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setComments([data, ...comments]);
    setContent("");
  }

  return (
    <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
      <h2 className="text-2xl font-bold">Commentaires</h2>

      <div className="mt-5 flex gap-3">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white"
        />

        <button
          type="button"
          onClick={addComment}
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          Publier
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-zinc-500">
            Aucun commentaire pour le moment.
          </p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium">
                {comment.auteur || "LMG"}
              </p>

              <p className="text-xs text-zinc-500">
                {new Date(comment.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>

            <p className="text-zinc-300">
              {comment.contenu}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}