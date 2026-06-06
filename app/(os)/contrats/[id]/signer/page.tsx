"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignerContratPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [signataire, setSignataire] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();

    if (!signataire.trim()) {
      alert("Ajoute le nom du signataire.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseBrowser
      .from("contrats")
      .update({
        statut: "Signé",
        signe_par: signataire,
        date_signature: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push(`/contrats/${id}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Signer le contrat</h1>
        <p className="mt-3 text-zinc-400">
          Confirme le signataire pour passer le contrat en statut signé.
        </p>
      </div>

      <form
        onSubmit={handleSign}
        className="max-w-2xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={signataire}
          onChange={(e) => setSignataire(e.target.value)}
          placeholder="Nom du signataire"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Signature..." : "Signer le contrat"}
        </button>
      </form>
    </main>
  );
}