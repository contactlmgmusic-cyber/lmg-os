"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

const documentTypes = [
  "Contrat",
  "Press Kit",
  "Master",
  "Facture",
  "Visuel",
  "Photo",
  "Administratif",
  "Autre",
];

export default function ArtisteDocumentsPage() {
  const params = useParams();
  const artisteId = params.id as string;

  const [artiste, setArtiste] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("Press Kit");
  const [visibleArtiste, setVisibleArtiste] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadData() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabaseBrowser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== ROLES.SUPER_ADMIN &&
      profile?.role !== ROLES.ADMIN &&
      profile?.role !== ROLES.MANAGER
    ) {
      window.location.href = "/";
      return;
    }

    const { data: artisteData } = await supabaseBrowser
      .from("artistes")
      .select("id, nom")
      .eq("id", artisteId)
      .single();

    const { data: docsData } = await supabaseBrowser
      .from("artiste_documents")
      .select("*")
      .eq("artiste_id", artisteId)
      .order("created_at", { ascending: false });

    setArtiste(artisteData);
    setDocuments(docsData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (artisteId) loadData();
  }, [artisteId]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!file || !titre || !artisteId) {
      alert("Titre et fichier obligatoires.");
      return;
    }

    setUploading(true);

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    const fileExt = file.name.split(".").pop();
    const filePath = `${artisteId}/${Date.now()}-${titre}.${fileExt}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from("artiste-documents")
      .upload(filePath, file);

    if (uploadError) {
      setUploading(false);
      alert(uploadError.message);
      return;
    }

    const { data: publicUrl } = supabaseBrowser.storage
      .from("artiste-documents")
      .getPublicUrl(filePath);

    const { error } = await supabaseBrowser.from("artiste_documents").insert({
      artiste_id: artisteId,
      titre,
      type,
      fichier_url: publicUrl.publicUrl,
      uploaded_by: user?.id || null,
      visible_artiste: visibleArtiste,
    });

    setUploading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitre("");
    setFile(null);
    setVisibleArtiste(true);

    await loadData();
  }

  async function deleteDocument(id: string) {
    if (!confirm("Supprimer ce document ?")) return;

    const { error } = await supabaseBrowser
      .from("artiste_documents")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href={`/artistes/${artisteId}`} className="text-sm text-zinc-400 hover:text-white">
        ← Retour à l’artiste
      </Link>

      <div className="mb-10 mt-8">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Documents artiste
        </p>

        <h1 className="text-5xl font-bold">
          {artiste?.nom || "Artiste"}
        </h1>

        <p className="mt-3 text-zinc-400">
          Contrats, press kits, masters, visuels, photos et documents administratifs.
        </p>
      </div>

      <form
        onSubmit={handleUpload}
        className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <h2 className="mb-6 text-3xl font-bold">Ajouter un document</h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre du document"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          >
            {documentTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-4 py-4 text-zinc-300">
            <input
              type="checkbox"
              checked={visibleArtiste}
              onChange={(e) => setVisibleArtiste(e.target.checked)}
            />
            Visible par l’artiste
          </label>
        </div>

        <button
          disabled={uploading}
          className="mt-6 rounded-xl bg-white px-6 py-4 font-semibold text-black disabled:opacity-50"
        >
          {uploading ? "Upload..." : "Ajouter document"}
        </button>
      </form>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="mb-6 text-3xl font-bold">Documents</h2>

        {documents.length === 0 && (
          <p className="text-zinc-500">Aucun document pour cet artiste.</p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-zinc-800 bg-black p-5"
            >
              <p className="text-sm text-blue-300">{doc.type}</p>

              <h3 className="mt-2 text-xl font-bold">{doc.titre}</h3>

              <p className="mt-2 text-xs text-zinc-500">
                {doc.visible_artiste ? "Visible artiste" : "Interne seulement"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {doc.fichier_url && (
                  <a
                    href={doc.fichier_url}
                    target="_blank"
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
                  >
                    Ouvrir
                  </a>
                )}

                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}