"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { notifyRoles } from "@/lib/notify";

export default function NouveauContratPage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("Contrat artiste");
  const [statut, setStatut] = useState("Brouillon");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [notes, setNotes] = useState("");
  const [fichierUrl, setFichierUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: artistesData } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom", { ascending: true });

      const { data: projetsData } = await supabaseBrowser
        .from("projets")
        .select("id, titre")
        .order("titre", { ascending: true });

      setArtistes(artistesData || []);
      setProjets(projetsData || []);
    }

    fetchData();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const filePath = `contrats/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

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

    setFichierUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titre.trim()) {
      alert("Le titre du contrat est obligatoire.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabaseBrowser
      .from("contrats")
      .insert({
        titre,
        type,
        statut,
        artiste_id: artisteId || null,
        projet_id: projetId || null,
        fichier_url: fichierUrl || null,
        notes,
      })
      .select("id")
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Contrat",
      titre: "Nouveau contrat ajouté",
      description: `${titre} • ${statut}`,
    });

    await notifyRoles({
      roles: ["super_admin", "manager"],
      type: "Contrat",
      titre: "Nouveau contrat ajouté",
      description: `${titre} • ${statut}`,
      link: `/contrats/${data.id}`,
    });

    if (statut === "Signé") {
      await supabaseBrowser.from("activity_logs").insert({
        type: "Contrat",
        titre: "Contrat signé",
        description: titre,
      });

      await notifyRoles({
        roles: ["super_admin", "manager"],
        type: "Contrat",
        titre: "Contrat signé",
        description: titre,
        link: `/contrats/${data.id}`,
      });
    }

    router.push("/contrats");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouveau contrat</h1>
        <p className="mt-3 text-zinc-400">
          Ajouter un contrat, une split sheet ou un document légal.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid max-w-6xl grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]"
      >
        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre du contrat"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          >
            <option>Contrat artiste</option>
            <option>Contrat booking</option>
            <option>Contrat prestation</option>
            <option>Split sheet</option>
            <option>Contrat producteur</option>
            <option>Autre document</option>
          </select>

          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          >
            <option>Brouillon</option>
            <option>Envoyé</option>
            <option>Signé</option>
            <option>Archivé</option>
          </select>

          <select
            value={artisteId}
            onChange={(e) => setArtisteId(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
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
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          >
            <option value="">Aucun projet lié</option>
            {projets.map((projet) => (
              <option key={projet.id} value={projet.id}>
                {projet.titre}
              </option>
            ))}
          </select>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes internes"
            className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer le contrat"}
          </button>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-2xl font-bold">Fichier PDF</h2>

          <label className="block cursor-pointer rounded-2xl border border-dashed border-zinc-700 bg-black p-8 text-center text-zinc-400 hover:border-white hover:text-white">
            {uploading ? "Upload..." : "Uploader un PDF"}

            <input
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              className="hidden"
            />
          </label>

          {fichierUrl && (
            <a
              href={fichierUrl}
              target="_blank"
              className="mt-5 block rounded-xl bg-white px-5 py-3 text-center font-medium text-black"
            >
              Ouvrir le fichier uploadé
            </a>
          )}
        </div>
      </form>
    </main>
  );
}