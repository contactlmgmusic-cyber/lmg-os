"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Impossible de créer le canvas.");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Erreur lors du recadrage."));
        return;
      }

      resolve(blob);
    }, "image/jpeg");
  });
}

export default function ImageCropUploader({
  folder,
  onUploaded,
}: {
  folder: string;
  onUploaded: (url: string) => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImageSrc(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  async function uploadCroppedImage() {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setUploading(true);

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      const filePath = `${folder}/${Date.now()}-photo.jpg`;

      const { error: uploadError } = await supabaseBrowser.storage
        .from("lmg-assets")
        .upload(filePath, croppedBlob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        alert(uploadError.message);
        setUploading(false);
        return;
      }

      const { data } = supabaseBrowser.storage
        .from("lmg-assets")
        .getPublicUrl(filePath);

      onUploaded(data.publicUrl);

      setImageSrc(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setUploading(false);
    } catch (error: any) {
      alert(error.message);
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block cursor-pointer rounded-xl border border-dashed border-zinc-700 bg-black px-4 py-6 text-center text-zinc-400 hover:border-white hover:text-white">
        Importer une photo

        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
      </label>

      {imageSrc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-white">
            <h2 className="mb-4 text-2xl font-bold">Recadrer la photo</h2>

            <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="mt-5">
              <label className="text-sm text-zinc-400">Zoom</label>

              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setImageSrc(null)}
                className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={uploadCroppedImage}
                disabled={uploading}
                className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {uploading ? "Upload..." : "Valider la photo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}