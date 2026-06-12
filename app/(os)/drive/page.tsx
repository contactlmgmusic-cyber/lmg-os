"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const categories = [
  "Tous",
  "Master",
  "Cover",
  "Clip",
  "Photo presse",
  "EPK",
  "Contrat",
  "Document interne",
  "Autre",
];

export default function DrivePage() {
  const [files, setFiles] = useState<any[]>([]);
  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);

  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState("Master");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filter, setFilter] = useState("Tous");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const { data: filesData } = await supabaseBrowser
      .from("drive_files")
      .select(`
        *,
        artistes ( id, nom ),
        projets ( id, titre )
      `)
      .order("created_at", { ascending: false });

    const { data: artistesData } = await supabaseBrowser
      .from("artistes")
      .select("id, nom")
      .order("nom");

    const { data: projetsData } = await supabaseBrowser
      .from("projets")
      .select("id, titre")
      .order("titre");

    setFiles(filesData || []);
    setArtistes(artistesData || []);
    setProjets(projetsData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function uploadFile(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedFile) {
      alert("Ajoute un fichier.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    const filePath = `${Date.now()}-${selectedFile.name}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from("lmg-drive")
      .upload(filePath, selectedFile);

    if (uploadError) {
      alert(uploadError.message);
      setLoading(false);
      return;
    }

    const { data: signedData } = await supabaseBrowser.storage
      .from("lmg-drive")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    const { error } = await supabaseBrowser.from("drive_files").insert({
      nom: nom || selectedFile.name,
      type: selectedFile.type || null,
      categorie,
      artiste_id: artisteId || null,
      projet_id: projetId || null,
      fichier_url: signedData?.signedUrl || filePath,
      taille: selectedFile.size,
      uploaded_by: user?.id || null,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setNom("");
    setCategorie("Master");
    setArtisteId("");
    setProjetId("");
    setSelectedFile(null);

    await loadData();
  }

  async function deleteFile(file: any) {
    if (!confirm("Supprimer ce fichier ?")) return;

    const path = file.fichier_url?.includes("lmg-drive/")
      ? file.fichier_url.split("lmg-drive/")[1]?.split("?")[0]
      : null;

    if (path) {
      await supabaseBrowser.storage.from("lmg-drive").remove([path]);
    }

    const { error } = await supabaseBrowser
      .from("drive_files")
      .delete()
      .eq("id", file.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  const filteredFiles =
    filter === "Tous"
      ? files
      : files.filter((file) => file.categorie === filter);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Drive
        </p>

        <h1 className="text-5xl font-bold">Drive LMG</h1>

        <p className="mt-3 text-zinc-400">
          Centralise masters, covers, clips, EPK, contrats et documents.
        </p>
      </div>

      <form
        onSubmit={uploadFile}
        className="mb-10 grid grid-cols-1 gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8 xl:grid-cols-2"
      >
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du fichier"
          className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          {categories.filter((c) => c !== "Tous").map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={artisteId}
          onChange={(e) => setArtisteId(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option value="">Aucun artiste lié</option>
          {artistes.map((artiste) => (
            <option key={artiste.id} value={artiste.id}>
              {artiste.nom}
            </option>
          ))}
        </select>

        <select
          value={projetId}
          onChange={(e) => setProjetId(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option value="">Aucun projet lié</option>
          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.titre}
            </option>
          ))}
        </select>

        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          disabled={loading}
          className="rounded-xl bg-white px-5 py-4 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Upload..." : "Uploader dans le Drive"}
        </button>
      </form>

      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full border px-4 py-2 text-sm ${
              filter === cat
                ? "border-white bg-white text-black"
                : "border-zinc-700 text-zinc-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredFiles.length === 0 && (
          <p className="text-zinc-500">Aucun fichier pour le moment.</p>
        )}

        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <p className="text-sm text-zinc-500">{file.categorie}</p>

            <h2 className="mt-2 text-2xl font-bold">{file.nom}</h2>

            <div className="mt-4 space-y-1 text-sm text-zinc-400">
              <p>Artiste : {file.artistes?.nom || "Non lié"}</p>
              <p>Projet : {file.projets?.titre || "Non lié"}</p>
              <p>
                Taille :{" "}
                {file.taille
                  ? `${(Number(file.taille) / 1024 / 1024).toFixed(2)} MB`
                  : "N/A"}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={file.fichier_url}
                target="_blank"
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
              >
                Ouvrir
              </a>

              <button
                onClick={() => deleteFile(file)}
                className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}