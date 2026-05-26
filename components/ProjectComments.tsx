"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Comment = {
  id: string;
  auteur: string | null;
  contenu: string;
  created_at: string;
};

export default function ProjectComments({
  projetId,
  initialComments = [],
}: {
  projetId: string;
  initialComments?: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [contenu, setContenu] = useState("");

async function addComment(e: React.FormEvent) {
  e.preventDefault();

  if (!contenu.trim()) return;

  const { data, error } = await supabaseBrowser
    .from("commentaires_projets")
    .insert({
      projet_id: projetId,
      auteur: "LMG",
      contenu,
    })
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  const { data: projet }: any = await supabaseBrowser
    .from("projets")
    .select(`
      id,
      titre,
      artiste_id,
      artistes (
        id,
        manager_id
      )
    `)
    .eq("id", projetId)
    .single();

  const managerId =
  Array.isArray(projet?.artistes)
    ? projet.artistes[0]?.manager_id
    : (projet?.artistes as any)?.manager_id;

if (managerId) {
  await supabaseBrowser.from("notifications").insert({
    user_id: managerId,
      type: "comment",
      titre: "Nouveau commentaire projet",
      description: projet.titre,
      link: `/projets/${projet.id}`,
    });
  }

  setComments([data, ...comments]);
  setContenu("");
}

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <h2 className="text-3xl font-bold">Commentaires</h2>

      <form onSubmit={addComment} className="mt-6 flex gap-3">
        <input
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <button className="rounded-2xl bg-white px-5 py-4 font-semibold text-black">
          Envoyer
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {comments.length === 0 && (
          <p className="text-zinc-500">Aucun commentaire pour le moment.</p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-2xl border border-zinc-800 bg-black p-5"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{comment.auteur || "LMG"}</p>

              <p className="text-xs text-zinc-500">
                {new Date(comment.created_at).toLocaleString("fr-FR")}
              </p>
            </div>

            <p className="mt-3 text-zinc-300">{comment.contenu}</p>
          </div>
        ))}
      </div>
    </div>
  );
}