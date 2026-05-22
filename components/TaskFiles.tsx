"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type TaskFile = {
  id: string;
  nom: string;
  url: string;
  type: string;
};

export default function TaskFiles({
  taskId,
  initialFiles,
}: {
  taskId: string;
  initialFiles: TaskFile[];
}) {
  const [files, setFiles] = useState(initialFiles || []);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const filePath = `${taskId}/${Date.now()}-${file.name}`;

    const { error: uploadError } =
      await supabaseBrowser.storage
        .from("task-files")
        .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } =
      supabaseBrowser.storage
        .from("task-files")
        .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { data, error } = await supabaseBrowser
      .from("fichiers_taches")
      .insert({
        tache_id: taskId,
        nom: file.name,
        url: publicUrl,
        type: file.type,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    setFiles([data, ...files]);
    setUploading(false);
  }

  async function deleteFile(id: string) {
    const confirmation = confirm(
      "Supprimer ce fichier ?"
    );

    if (!confirmation) return;

    const { error } = await supabaseBrowser
      .from("fichiers_taches")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setFiles(
      files.filter((file) => file.id !== id)
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Fichiers
        </h2>

        <label className="cursor-pointer rounded-xl bg-white px-5 py-3 font-medium text-black hover:opacity-90">
          {uploading
            ? "Upload..."
            : "Ajouter fichier"}

          <input
            type="file"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="mt-6 space-y-4">
        {files.length === 0 && (
          <p className="text-sm text-zinc-500">
            Aucun fichier pour le moment.
          </p>
        )}

        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div>
              <p className="font-medium">
                {file.nom}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {file.type}
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={file.url}
                target="_blank"
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Ouvrir
              </a>

              <button
                type="button"
                onClick={() =>
                  deleteFile(file.id)
                }
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
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