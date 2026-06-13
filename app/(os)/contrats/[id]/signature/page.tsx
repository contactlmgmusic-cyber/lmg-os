"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { notifyRoles } from "@/lib/notify";

export default function SignatureContratPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [contrat, setContrat] = useState<any>(null);
  const [signePar, setSignePar] = useState("");
  const [dateSignature, setDateSignature] = useState("");
  const [signatureNotes, setSignatureNotes] = useState("");
  const [fichierSigneUrl, setFichierSigneUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadContrat() {
      const { data, error } = await supabaseBrowser
        .from("contrats")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert(error?.message || "Contrat introuvable.");
        router.push("/contrats");
        return;
      }

      setContrat(data);
      setSignePar(data.signe_par || "");
      setDateSignature(
        data.date_signature || new Date().toISOString().split("T")[0]
      );
      setSignatureNotes(data.signature_notes || "");
      setFichierSigneUrl(data.fichier_signe_url || "");
    }

    if (id) loadContrat();
  }, [id, router]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const filePath = `contrats-signes/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabaseBrowser.storage
      .from("lmg-assets")
      .upload(filePath, file);

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabaseBrowser.storage
      .from("lmg-assets")
      .getPublicUrl(filePath);

    setFichierSigneUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!signePar.trim()) {
      alert("Indique qui a signé le contrat.");
      return;
    }

    setSaving(true);

    const { error } = await supabaseBrowser
      .from("contrats")
      .update({
        statut: "Signé",
        signe_par: signePar,
        date_signature: dateSignature || new Date().toISOString().split("T")[0],
        fichier_signe_url: fichierSigneUrl || null,
        signature_notes: signatureNotes || null,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Contrat",
      titre: "Contrat signé",
      description: `${contrat?.titre || "Un contrat"} signé par ${signePar}`,
      artiste_id: contrat?.artiste_id || null,
    });

    await notifyRoles({
      roles: ["super_admin", "admin"],
      type: "Contrat",
      titre: "Contrat signé",
      description: `${contrat?.titre || "Un contrat"} • ${signePar}`,
      link: `/contrats/${id}`,
    });

    router.push(`/contrats/${id}`);
    router.refresh();
  }

  if (!contrat) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link
        href={`/contrats/${id}`}
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour contrat
      </Link>

      <div className="mt-8 mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Signature contrat
        </p>

        <h1 className="text-5xl font-bold">{contrat.titre}</h1>

        <p className="mt-3 text-zinc-400">
          Marquer le contrat comme signé et archiver le PDF signé.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={signePar}
          onChange={(e) => setSignePar(e.target.value)}
          placeholder="Signé par"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <input
          type="date"
          value={dateSignature}
          onChange={(e) => setDateSignature(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <label className="block cursor-pointer rounded-2xl border border-dashed border-zinc-700 bg-black p-8 text-center text-zinc-400 hover:border-white hover:text-white">
          {uploading ? "Upload..." : "Uploader le PDF signé"}

          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        {fichierSigneUrl && (
          <a
            href={fichierSigneUrl}
            target="_blank"
            className="block rounded-xl bg-white px-5 py-3 text-center font-medium text-black"
          >
            Ouvrir le PDF signé
          </a>
        )}

        <textarea
          value={signatureNotes}
          onChange={(e) => setSignatureNotes(e.target.value)}
          placeholder="Notes de signature"
          className="min-h-36 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <button
          disabled={saving}
          className="w-full rounded-xl bg-white px-5 py-4 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Valider la signature"}
        </button>
      </form>
    </main>
  );
}