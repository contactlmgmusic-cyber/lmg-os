"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignatureContractForm({
  contratId,
}: {
  contratId: string;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [saving, setSaving] = useState(false);

  function getCanvasContext() {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffffff";

    return ctx;
  }

  function getPosition(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    const ctx = getCanvasContext();
    if (!ctx) return;

    const { x, y } = getPosition(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing) return;

    const ctx = getCanvasContext();
    if (!ctx) return;

    const { x, y } = getPosition(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    setDrawing(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function saveSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      alert("Utilisateur non connecté.");
      setSaving(false);
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Signature vide ou invalide.");
        setSaving(false);
        return;
      }

      const filePath = `signatures/${contratId}-${Date.now()}.png`;

      const { error: uploadError } = await supabaseBrowser.storage
        .from("lmg-assets")
        .upload(filePath, blob, {
          contentType: "image/png",
        });

      if (uploadError) {
        alert(uploadError.message);
        setSaving(false);
        return;
      }

      const { data } = supabaseBrowser.storage
        .from("lmg-assets")
        .getPublicUrl(filePath);

      const { error } = await supabaseBrowser
        .from("contrats")
        .update({
          signature_url: data.publicUrl,
          signed_at: new Date().toISOString(),
          signed_by: user.id,
          statut: "Signé",
        })
        .eq("id", contratId);

      if (error) {
        alert(error.message);
        setSaving(false);
        return;
      }

      await supabaseBrowser.from("activity_logs").insert({
        type: "Contrat",
        titre: "Contrat signé",
        description: `Contrat ${contratId} signé`,
      });

      router.push(`/contrats/${contratId}`);
      router.refresh();
    }, "image/png");
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-5xl font-bold">
          Signer le contrat
        </h1>

        <p className="mt-3 text-zinc-400">
          Dessine ta signature dans la zone ci-dessous.
        </p>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <canvas
            ref={canvasRef}
            width={900}
            height={320}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="h-80 w-full cursor-crosshair rounded-2xl border border-zinc-700 bg-black"
          />

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={clearSignature}
              className="rounded-xl border border-zinc-700 px-5 py-4 text-zinc-300 hover:bg-zinc-800"
            >
              Effacer
            </button>

            <button
              type="button"
              onClick={saveSignature}
              disabled={saving}
              className="rounded-xl bg-white px-5 py-4 font-semibold text-black hover:bg-zinc-200"
            >
              {saving ? "Signature..." : "Valider la signature"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}