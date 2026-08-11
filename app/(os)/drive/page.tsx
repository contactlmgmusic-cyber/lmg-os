"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

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
    .select("id, role, artiste_id")
    .eq("id", user.id)
    .single();

  if (
    profile?.role !== ROLES.SUPER_ADMIN &&
    profile?.role !== ROLES.ADMIN &&
    profile?.role !== ROLES.ARTISTIC_DIRECTOR &&
    profile?.role !== ROLES.MANAGER &&
    profile?.role !== ROLES.ARTISTE
  ) {
    window.location.href = "/";
    return;
  }

  setCurrentUserId(user.id);
  setCurrentRole(profile.role);

  if (
  profile.role === ROLES.ARTISTE
) {
  if (!profile.artiste_id) {
    setFiles([]);
    setArtistes([]);
    setProjets([]);
    return;
  }

  const { data: artisteData } =
    await supabaseBrowser
      .from("artistes")
      .select("id, nom")
      .eq(
        "id",
        profile.artiste_id
      )
      .single();

  const { data: projetsData } =
    await supabaseBrowser
      .from("projets")
      .select(
        "id, titre, artiste_id"
      )
      .eq(
        "artiste_id",
        profile.artiste_id
      )
      .order("titre");

  const projetIds =
    (projetsData || []).map(
      (projet: any) =>
        projet.id
    );

  const driveFilters = [
    `artiste_id.eq.${profile.artiste_id}`,
  ];

  if (projetIds.length > 0) {
    driveFilters.push(
      `projet_id.in.(${projetIds.join(
        ","
      )})`
    );
  }

  const { data: filesData } =
    await supabaseBrowser
      .from("drive_files")
      .select(`
        *,
        artistes ( id, nom ),
        projets ( id, titre )
      `)
      .or(
        driveFilters.join(",")
      )
      .order("created_at", {
        ascending: false,
      });

  setFiles(filesData || []);
  setArtistes(
    artisteData
      ? [artisteData]
      : []
  );
  setProjets(
    projetsData || []
  );

  return;
}

  if (profile.role === ROLES.MANAGER) {
    const { data: artistesData } = await supabaseBrowser
      .from("artistes")
      .select("id, nom")
      .eq("manager_id", profile.id)
      .order("nom");

    const artisteIds = (artistesData || []).map(
      (artiste: any) => artiste.id
    );

    let projetsData: any[] = [];

    if (artisteIds.length > 0) {
      const { data } = await supabaseBrowser
        .from("projets")
        .select("id, titre, artiste_id")
        .in("artiste_id", artisteIds)
        .order("titre");

      projetsData = data || [];
    }

    const projetIds = projetsData.map((projet: any) => projet.id);

    const driveFilters = [`uploaded_by.eq.${user.id}`];

    if (artisteIds.length > 0) {
      driveFilters.push(`artiste_id.in.(${artisteIds.join(",")})`);
    }

    if (projetIds.length > 0) {
      driveFilters.push(`projet_id.in.(${projetIds.join(",")})`);
    }

    const { data: filesData } = await supabaseBrowser
      .from("drive_files")
      .select(`
        *,
        artistes ( id, nom ),
        projets ( id, titre )
      `)
      .or(driveFilters.join(","))
      .order("created_at", { ascending: false });

    setFiles(filesData || []);
    setArtistes(artistesData || []);
    setProjets(projetsData);
    return;
  }

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

  async function uploadFile(
  e: React.FormEvent
) {
  e.preventDefault();

  if (!selectedFile) {
    alert("Ajoute un fichier.");
    return;
  }

  if (!currentUserId || !currentRole) {
    alert(
      "Impossible de vérifier ton accès."
    );
    return;
  }

  if (currentRole === ROLES.MANAGER) {
    const artisteAutorise =
      !artisteId ||
      artistes.some(
        (artiste: any) =>
          artiste.id === artisteId
      );

    const projetAutorise =
      !projetId ||
      projets.some(
        (projet: any) =>
          projet.id === projetId
      );

    if (
      !artisteAutorise ||
      !projetAutorise
    ) {
      alert(
        "Tu ne peux pas associer ce fichier à cet artiste ou ce projet."
      );
      return;
    }
  }

  setLoading(true);

  try {
    const {
      data: { session },
    } =
      await supabaseBrowser.auth.getSession();

    const accessToken =
      session?.access_token;

    if (!accessToken) {
      throw new Error(
        "Session utilisateur introuvable."
      );
    }

    const startResponse = await fetch(
      "/api/google-drive/upload/start",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          mimeType:
            selectedFile.type ||
            "application/octet-stream",
          fileSize: selectedFile.size,
          categorie,
          artisteId,
          projetId,
        }),
      }
    );

    const startResult =
      await startResponse.json();

    if (
      !startResponse.ok ||
      !startResult.uploadUrl
    ) {
      throw new Error(
        startResult.error ||
          "Impossible de préparer l’upload."
      );
    }

    const chunkSize =
  3 * 1024 * 1024;

let offset = 0;
let googleFile: any = null;

while (offset < selectedFile.size) {
  const end = Math.min(
    offset + chunkSize,
    selectedFile.size
  );

  const chunk =
    selectedFile.slice(offset, end);

  const chunkResponse = await fetch(
    "/api/google-drive/upload/chunk",
    {
      method: "PUT",
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
        "Content-Type":
          "application/octet-stream",
        "X-Google-Upload-Url":
          startResult.uploadUrl,
        "X-File-Content-Type":
          selectedFile.type ||
          "application/octet-stream",
        "Content-Range":
          `bytes ${offset}-${end - 1}/${selectedFile.size}`,
      },
      body: chunk,
    }
  );

  const chunkResult =
    await chunkResponse.json();

  if (!chunkResponse.ok) {
    throw new Error(
      chunkResult.error ||
        "L’envoi du fichier vers Google Drive a échoué."
    );
  }

  if (chunkResult.complete) {
    googleFile = chunkResult.file;
  }

  offset = end;
}

if (!googleFile?.id) {
  throw new Error(
    "Google Drive n’a pas retourné l’identifiant du fichier."
  );
}

    const finishResponse = await fetch(
      "/api/google-drive/upload/finish",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          googleDriveFileId:
            googleFile.id,
            folderId: startResult.folderId,
          nom:
            nom.trim() ||
            selectedFile.name,
          categorie,
          artisteId,
          projetId,
        }),
      }
    );

    const finishResult =
      await finishResponse.json();

    if (!finishResponse.ok) {
      throw new Error(
        finishResult.error ||
          "Impossible d’enregistrer le fichier dans LMG OS."
      );
    }

    setNom("");
    setCategorie("Master");
    setArtisteId("");
    setProjetId("");
    setSelectedFile(null);

    await loadData();

    alert(
      "Fichier ajouté au Drive central LMG."
    );
  } catch (error) {
    console.error(
      "Erreur upload Google Drive :",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "L’upload a échoué."
    );
  } finally {
    setLoading(false);
  }
}

  async function deleteFile(file: any) {
  if (!confirm("Supprimer ce fichier ?")) {
    return;
  }

  if (
    currentRole !== ROLES.SUPER_ADMIN &&
    currentRole !== ROLES.ADMIN &&
    currentRole !==
      ROLES.ARTISTIC_DIRECTOR &&
    !(
      currentRole === ROLES.MANAGER &&
      file.uploaded_by ===
        currentUserId
    )
  ) {
    alert(
      "Tu n’as pas l’autorisation de supprimer ce fichier."
    );
    return;
  }

  try {
    if (
      file.storage_provider ===
        "google_drive" &&
      file.google_drive_file_id
    ) {
      const response = await fetch(
        `/api/google-drive/files/${file.google_drive_file_id}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Impossible de supprimer ce fichier."
        );
      }
    } else {
      const path =
        file.fichier_url?.includes(
          "lmg-drive/"
        )
          ? file.fichier_url
              .split("lmg-drive/")[1]
              ?.split("?")[0]
          : null;

      if (path) {
        const { error: storageError } =
          await supabaseBrowser.storage
            .from("lmg-drive")
            .remove([path]);

        if (storageError) {
          throw storageError;
        }
      }

      const { error: deleteError } =
        await supabaseBrowser
          .from("drive_files")
          .delete()
          .eq("id", file.id);

      if (deleteError) {
        throw deleteError;
      }
    }

    await loadData();
  } catch (error) {
    console.error(
      "Erreur suppression fichier :",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Impossible de supprimer ce fichier."
    );
  }
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

{currentRole &&
  currentRole !== ROLES.ARTISTE && (

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
      )}

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

              {(
  currentRole === ROLES.SUPER_ADMIN ||
  currentRole === ROLES.ADMIN ||
  currentRole === ROLES.ARTISTIC_DIRECTOR ||
  (currentRole === ROLES.MANAGER &&
    file.uploaded_by === currentUserId)
) && (
  <button
    onClick={() => deleteFile(file)}
    className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
  >
    Supprimer
  </button>
)}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}