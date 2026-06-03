"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type TaskFile = {
  id: string;
  filename: string;
  file_url: string;
  file_path: string;
  created_at: string;
};

export default function TaskFiles({
  taskId,
  initialFiles,
}: {
  taskId: string;
  initialFiles: TaskFile[];
}) {
  const [files, setFiles] = useState<TaskFile[]>(initialFiles || []);
  const [uploading, setUploading] = useState(false);

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    const filePath = `${taskId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from("task-files")
      .upload(filePath, file);

    if (uploadError) {
      setUploading(false);
      alert(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabaseBrowser.storage
      .from("task-files")
      .getPublicUrl(filePath);

    const { data, error } = await supabaseBrowser
      .from("task_files")
      .insert({
        task_id: taskId,
        user_id: user?.id || null,
        filename: file.name,
        file_url: publicUrlData.publicUrl,
        file_path: filePath,
      })
      .select("id, filename, file_url, file_path, created_at")
      .single();

    setUploading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setFiles((current) => [data as TaskFile, ...current]);
  }

  async function deleteFile(file: TaskFile) {
    const confirmed = confirm(`Supprimer ${file.filename} ?`);

    if (!confirmed) return;

    const { error: storageError } = await supabaseBrowser.storage
      .from("task-files")
      .remove([file.file_path]);

    if (storageError) {
      alert(storageError.message);
      return;
    }

    const { error } = await supabaseBrowser
      .from("task_files")
      .delete()
      .eq("id", file.id);

    if (error) {
      alert(error.message);
      return;
    }

    setFiles((current) => current.filter((item) => item.id !== file.id));
  }

  return (
    <div className="mt-8 rounded-2xl bg-black p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Fichiers</h2>

        {uploading && <p className="text-xs text-zinc-500">Upload...</p>}
      </div>

      <label className="mb-5 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-6 text-sm text-zinc-400 hover:border-white hover:text-white">
        <input type="file" className="hidden" onChange={uploadFile} />
        Ajouter un fichier
      </label>

      <div className="space-y-3">
        {files.length === 0 && (
          <p className="text-sm text-zinc-500">Aucun fichier ajouté.</p>
        )}

        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <a
              href={file.file_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-white hover:underline"
            >
              {file.filename}
            </a>

            <button
              type="button"
              onClick={() => deleteFile(file)}
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