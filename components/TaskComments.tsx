"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Comment = {
  id: string;
  contenu: string;
  created_at: string;
  profiles?: {
    nom: string | null;
    full_name?: string | null;
    avatar_url: string | null;
  } | null;
};

export default function TaskComments({
  taskId,
  initialComments,
}: {
  taskId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function addComment() {
    if (!content.trim()) return;

    setSaving(true);

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    const { data, error } = await supabaseBrowser
      .from("task_comments")
      .insert({
        task_id: taskId,
        user_id: user?.id || null,
        contenu: content.trim(),
      })
      .select(`
        id,
        contenu,
        created_at,
        profiles (
          nom,
          full_name,
          avatar_url
        )
      `)
      .single();

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setComments((current) => [data as any, ...current]);
    setContent("");
  
  await supabaseBrowser.from("task_activity_logs").insert({
  task_id: taskId,
  user_id: user?.id || null,
  type: "commentaire",
  message: "A ajouté un commentaire",
});

}

  return (
    <div className="mt-8 rounded-2xl bg-black p-6">
      <h2 className="mb-4 text-2xl font-bold">Commentaires</h2>

      <div className="mb-6 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ajouter un commentaire..."
          rows={3}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white"
        />

        <button
          type="button"
          onClick={addComment}
          disabled={saving}
          className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Publication..." : "Publier"}
        </button>
      </div>

      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-zinc-500">Aucun commentaire.</p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <p className="text-sm text-white">{comment.contenu}</p>

            <p className="mt-3 text-xs text-zinc-500">
              {comment.profiles?.nom ||
                comment.profiles?.full_name ||
                "Utilisateur"}{" "}
              · {new Date(comment.created_at).toLocaleString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}