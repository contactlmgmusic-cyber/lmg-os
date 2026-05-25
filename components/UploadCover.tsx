"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

export default function UploadCover({
  onUpload,
}: {
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";

const fileName = `covers/${Date.now()}-${Math.random()
  .toString(36)
  .substring(2)}.${fileExt}`;

    const { error } = await supabaseBrowser.storage
      .from("lmg-assets")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabaseBrowser.storage
      .from("lmg-assets")
      .getPublicUrl(fileName);

    onUpload(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-sm text-white"
      />

      {uploading && (
        <p className="text-sm text-zinc-400">
          Upload cover en cours...
        </p>
      )}
    </div>
  );
}