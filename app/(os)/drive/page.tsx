"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

type Artist = { id: string; nom: string | null };
type Project = { id: string; titre: string | null; artiste_id?: string | null };
type DriveFile = {
  id: string; nom: string | null; categorie: string | null;
  fichier_url: string | null; taille: number | string | null;
  created_at: string | null; uploaded_by: string | null;
  storage_provider: string | null; google_drive_file_id: string | null;
  artistes: Artist | null; projets: Pick<Project, "id" | "titre"> | null;
};

const categories = ["Tous", "Master", "Cover", "Clip", "Photo presse", "EPK", "Contrat", "Document interne", "Autre"] as const;
const categoryLabels: Record<string, string> = {
  Master: "Audio", Cover: "Visuel", Clip: "Vidéo", "Photo presse": "Presse",
  EPK: "Promotion", Contrat: "Juridique", "Document interne": "Interne", Autre: "Document",
};

function formatSize(value: DriveFile["taille"]) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "Taille inconnue";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} Mo`;
}

function formatDate(value: string | null) {
  if (!value) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default function DrivePage() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [artistes, setArtistes] = useState<Artist[]>([]);
  const [projets, setProjets] = useState<Project[]>([]);
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState("Master");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = currentRole !== null && currentRole !== ROLES.ARTISTE;
  const canManageConnection = currentRole === ROLES.SUPER_ADMIN || currentRole === ROLES.ADMIN;

  async function loadData() {
    setPageLoading(true);
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    const { data: profile } = await supabaseBrowser.from("profiles").select("id, role, artiste_id").eq("id", user.id).single();
    const roles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER, ROLES.ARTISTE];
    if (!profile || !roles.includes(profile.role)) { window.location.href = "/"; return; }
    setCurrentUserId(user.id); setCurrentRole(profile.role);

    try {
      if (profile.role === ROLES.ARTISTE) {
        if (!profile.artiste_id) { setFiles([]); setArtistes([]); setProjets([]); return; }
        const [{ data: artisteData }, { data: projetsData }] = await Promise.all([
          supabaseBrowser.from("artistes").select("id, nom").eq("id", profile.artiste_id).single(),
          supabaseBrowser.from("projets").select("id, titre, artiste_id").eq("artiste_id", profile.artiste_id).order("titre"),
        ]);
        const projectRows = (projetsData || []) as Project[];
        const projectIds = projectRows.map((project) => project.id);
        const filters = [`artiste_id.eq.${profile.artiste_id}`];
        if (projectIds.length) filters.push(`projet_id.in.(${projectIds.join(",")})`);
        const { data } = await supabaseBrowser.from("drive_files").select("*, artistes ( id, nom ), projets ( id, titre )").or(filters.join(",")).order("created_at", { ascending: false });
        setFiles((data || []) as DriveFile[]); setArtistes(artisteData ? [artisteData as Artist] : []); setProjets(projectRows); return;
      }

      if (profile.role === ROLES.MANAGER) {
        const { data: artistesData } = await supabaseBrowser.from("artistes").select("id, nom").eq("manager_id", profile.id).order("nom");
        const artistRows = (artistesData || []) as Artist[];
        const artistIds = artistRows.map((artist) => artist.id);
        let projectRows: Project[] = [];
        if (artistIds.length) {
          const { data } = await supabaseBrowser.from("projets").select("id, titre, artiste_id").in("artiste_id", artistIds).order("titre");
          projectRows = (data || []) as Project[];
        }
        const filters = [`uploaded_by.eq.${user.id}`];
        if (artistIds.length) filters.push(`artiste_id.in.(${artistIds.join(",")})`);
        if (projectRows.length) filters.push(`projet_id.in.(${projectRows.map((project) => project.id).join(",")})`);
        const { data } = await supabaseBrowser.from("drive_files").select("*, artistes ( id, nom ), projets ( id, titre )").or(filters.join(",")).order("created_at", { ascending: false });
        setFiles((data || []) as DriveFile[]); setArtistes(artistRows); setProjets(projectRows); return;
      }

      const [{ data: filesData }, { data: artistesData }, { data: projetsData }] = await Promise.all([
        supabaseBrowser.from("drive_files").select("*, artistes ( id, nom ), projets ( id, titre )").order("created_at", { ascending: false }),
        supabaseBrowser.from("artistes").select("id, nom").order("nom"),
        supabaseBrowser.from("projets").select("id, titre, artiste_id").order("titre"),
      ]);
      setFiles((filesData || []) as DriveFile[]); setArtistes((artistesData || []) as Artist[]); setProjets((projetsData || []) as Project[]);
    } finally { setPageLoading(false); }
  }

  useEffect(() => { void loadData(); }, []);

  async function uploadFile(event: React.FormEvent) {
    event.preventDefault(); setMessage(null);
    if (!selectedFile) { setMessage({ type: "error", text: "Sélectionne le fichier à ajouter." }); return; }
    if (!currentUserId || !currentRole) { setMessage({ type: "error", text: "Impossible de vérifier ton accès." }); return; }
    if (currentRole === ROLES.MANAGER) {
      const allowedArtist = !artisteId || artistes.some((artist) => artist.id === artisteId);
      const allowedProject = !projetId || projets.some((project) => project.id === projetId);
      if (!allowedArtist || !allowedProject) { setMessage({ type: "error", text: "Cet artiste ou ce projet ne fait pas partie de ton périmètre." }); return; }
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session?.access_token) throw new Error("Session utilisateur introuvable.");
      const auth = { Authorization: `Bearer ${session.access_token}` };
      const startResponse = await fetch("/api/google-drive/upload/start", {
        method: "POST", headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: selectedFile.name, mimeType: selectedFile.type || "application/octet-stream", fileSize: selectedFile.size, categorie, artisteId, projetId }),
      });
      const startResult = await startResponse.json();
      if (!startResponse.ok || !startResult.uploadUrl) throw new Error(startResult.error || "Impossible de préparer l’envoi.");
      const chunkSize = 3 * 1024 * 1024;
      let offset = 0; let googleFile: { id?: string } | null = null;
      while (offset < selectedFile.size) {
        const end = Math.min(offset + chunkSize, selectedFile.size);
        const response = await fetch("/api/google-drive/upload/chunk", {
          method: "PUT",
          headers: { ...auth, "Content-Type": "application/octet-stream", "X-Google-Upload-Url": startResult.uploadUrl, "X-File-Content-Type": selectedFile.type || "application/octet-stream", "Content-Range": `bytes ${offset}-${end - 1}/${selectedFile.size}` },
          body: selectedFile.slice(offset, end),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "L’envoi vers Google Drive a échoué.");
        if (result.complete) googleFile = result.file; offset = end;
      }
      if (!googleFile?.id) throw new Error("Google Drive n’a pas confirmé le fichier.");
      const finishResponse = await fetch("/api/google-drive/upload/finish", {
        method: "POST", headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ googleDriveFileId: googleFile.id, folderId: startResult.folderId, nom: nom.trim() || selectedFile.name, categorie, artisteId, projetId }),
      });
      const finishResult = await finishResponse.json();
      if (!finishResponse.ok) throw new Error(finishResult.error || "Impossible d’enregistrer le fichier dans LMG OS.");
      setNom(""); setCategorie("Master"); setArtisteId(""); setProjetId(""); setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadData(); setShowUpload(false);
      setMessage({ type: "success", text: "Le fichier a été classé dans le Drive central LMG." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "L’envoi a échoué." });
    } finally { setUploading(false); }
  }

  async function deleteFile(file: DriveFile) {
    if (!window.confirm(`Supprimer définitivement « ${file.nom || "ce fichier"} » ?`)) return;
    const authorized = currentRole === ROLES.SUPER_ADMIN || currentRole === ROLES.ADMIN || currentRole === ROLES.ARTISTIC_DIRECTOR || (currentRole === ROLES.MANAGER && file.uploaded_by === currentUserId);
    if (!authorized) { setMessage({ type: "error", text: "Tu n’as pas l’autorisation de supprimer ce fichier." }); return; }
    setDeletingId(file.id); setMessage(null);
    try {
      if (file.storage_provider === "google_drive" && file.google_drive_file_id) {
        const response = await fetch(`/api/google-drive/files/${file.google_drive_file_id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Impossible de supprimer ce fichier.");
      } else {
        const path = file.fichier_url?.includes("lmg-drive/") ? file.fichier_url.split("lmg-drive/")[1]?.split("?")[0] : null;
        if (path) { const { error } = await supabaseBrowser.storage.from("lmg-drive").remove([path]); if (error) throw error; }
        const { error } = await supabaseBrowser.from("drive_files").delete().eq("id", file.id); if (error) throw error;
      }
      setFiles((current) => current.filter((item) => item.id !== file.id));
      setMessage({ type: "success", text: "Fichier supprimé." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Impossible de supprimer ce fichier." });
    } finally { setDeletingId(null); }
  }

  const availableProjects = useMemo(() => artisteId ? projets.filter((project) => !project.artiste_id || project.artiste_id === artisteId) : projets, [artisteId, projets]);
  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return files.filter((file) => (filter === "Tous" || file.categorie === filter) && (!query || [file.nom, file.categorie, file.artistes?.nom, file.projets?.titre].some((value) => value?.toLowerCase().includes(query))));
  }, [files, filter, search]);
  const totalBytes = files.reduce((sum, file) => sum + (Number(file.taille) || 0), 0);
  const linkedFiles = files.filter((file) => file.artistes || file.projets).length;

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">Ressources · LMG Music</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Drive LMG</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">La bibliothèque centrale des masters, visuels, contrats et documents de production.</p></div>
        <div className="flex flex-wrap gap-3">
          {canManageConnection && <Link href="/drive/manager" className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white">Gérer la connexion</Link>}
          {canUpload && <button type="button" onClick={() => setShowUpload((value) => !value)} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200">{showUpload ? "Fermer" : "+ Ajouter un fichier"}</button>}
        </div>
      </header>

      {message && <div role="status" className={`mb-6 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-sm ${message.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-red-500/30 bg-red-500/10 text-red-200"}`}><span>{message.text}</span><button type="button" onClick={() => setMessage(null)} className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100">Fermer</button></div>}

      {showUpload && canUpload && <section className="mb-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-6 py-5 sm:px-8"><h2 className="text-xl font-bold">Ajouter à la bibliothèque</h2><p className="mt-1 text-sm text-zinc-500">Le fichier sera automatiquement classé dans le bon dossier du Drive LMG.</p></div>
        <form onSubmit={uploadFile} className="grid gap-5 p-6 sm:p-8 xl:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-zinc-300"><span>Nom affiché <span className="font-normal text-zinc-600">(facultatif)</span></span><input value={nom} onChange={(event) => setNom(event.target.value)} placeholder={selectedFile?.name || "Ex. Master final — titre"} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3.5 outline-none placeholder:text-zinc-700 focus:border-zinc-500" /></label>
          <label className="space-y-2 text-sm font-medium text-zinc-300"><span>Catégorie</span><select value={categorie} onChange={(event) => setCategorie(event.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3.5 outline-none focus:border-zinc-500">{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="space-y-2 text-sm font-medium text-zinc-300"><span>Artiste concerné</span><select value={artisteId} onChange={(event) => { setArtisteId(event.target.value); setProjetId(""); }} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3.5 outline-none focus:border-zinc-500"><option value="">Aucun artiste lié</option>{artistes.map((artist) => <option key={artist.id} value={artist.id}>{artist.nom || "Artiste sans nom"}</option>)}</select></label>
          <label className="space-y-2 text-sm font-medium text-zinc-300"><span>Projet concerné</span><select value={projetId} onChange={(event) => setProjetId(event.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3.5 outline-none focus:border-zinc-500"><option value="">Aucun projet lié</option>{availableProjects.map((project) => <option key={project.id} value={project.id}>{project.titre || "Projet sans titre"}</option>)}</select></label>
          <label className="space-y-2 text-sm font-medium text-zinc-300 xl:col-span-2"><span>Fichier</span><div className="rounded-2xl border border-dashed border-zinc-700 bg-black p-5 focus-within:border-zinc-400"><input ref={fileInputRef} type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black" />{selectedFile && <p className="mt-3 text-xs text-zinc-500">{formatSize(selectedFile.size)} · le nom d’origine sera conservé dans Google Drive.</p>}</div></label>
          <div className="flex flex-col gap-3 border-t border-zinc-900 pt-5 sm:flex-row sm:items-center sm:justify-between xl:col-span-2"><p className="text-xs text-zinc-600">Choisis l’artiste et le projet pour garantir le bon classement.</p><button disabled={uploading || !selectedFile} className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">{uploading ? "Classement en cours…" : "Envoyer et classer"}</button></div>
        </form>
      </section>}

      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[{ label: "Fichiers", value: files.length }, { label: "Rattachés", value: linkedFiles }, { label: "Catégories actives", value: new Set(files.map((file) => file.categorie).filter(Boolean)).size }, { label: "Volume référencé", value: formatSize(totalBytes) }].map((stat) => <div key={stat.label} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">{stat.label}</p><p className="mt-3 text-2xl font-bold sm:text-3xl">{stat.value}</p></div>)}
      </section>

      <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Bibliothèque</h2><p className="mt-1 text-sm text-zinc-600">{filteredFiles.length} résultat{filteredFiles.length > 1 ? "s" : ""}</p></div><div className="flex gap-2"><button type="button" onClick={() => setView("grid")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === "grid" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>Grille</button><button type="button" onClick={() => setView("list")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === "list" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>Liste</button></div></div>
          <div className="mt-5 flex flex-col gap-3 xl:flex-row"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un fichier, un artiste ou un projet…" className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none placeholder:text-zinc-700 focus:border-zinc-500" /><div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-xl border px-3.5 py-3 text-xs font-semibold ${filter === item ? "border-white bg-white text-black" : "border-zinc-800 text-zinc-500 hover:text-white"}`}>{item}</button>)}</div></div>
        </div>

        {pageLoading ? <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-zinc-900" />)}</div> : filteredFiles.length === 0 ? <div className="px-6 py-20 text-center"><p className="text-lg font-semibold">Aucun fichier trouvé</p><p className="mt-2 text-sm text-zinc-600">{search || filter !== "Tous" ? "Modifie la recherche ou les filtres." : "La bibliothèque est prête à recevoir son premier document."}</p>{canUpload && !search && filter === "Tous" && <button type="button" onClick={() => setShowUpload(true)} className="mt-6 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold">Ajouter un fichier</button>}</div> : <div className={view === "grid" ? "grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3" : "divide-y divide-zinc-900"}>
          {filteredFiles.map((file) => {
            const canDelete = currentRole === ROLES.SUPER_ADMIN || currentRole === ROLES.ADMIN || currentRole === ROLES.ARTISTIC_DIRECTOR || (currentRole === ROLES.MANAGER && file.uploaded_by === currentUserId);
            return <article key={file.id} className={view === "grid" ? "flex min-h-56 flex-col rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-700" : "flex flex-col gap-4 px-5 py-5 hover:bg-black sm:flex-row sm:items-center"}>
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{categoryLabels[file.categorie || ""] || "Document"}</span><span className="truncate text-xs text-zinc-600">{file.categorie || "Sans catégorie"}</span></div><h3 className="mt-4 truncate text-lg font-bold" title={file.nom || "Fichier sans nom"}>{file.nom || "Fichier sans nom"}</h3><p className="mt-2 truncate text-sm text-zinc-500">{file.projets?.titre || file.artistes?.nom || "Bibliothèque générale"}</p><div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-700"><span>{formatDate(file.created_at)}</span><span>{formatSize(file.taille)}</span>{file.storage_provider === "google_drive" && <span>Drive LMG</span>}</div></div>
              <div className={`flex items-center gap-2 ${view === "grid" ? "mt-6 border-t border-zinc-900 pt-4" : "sm:justify-end"}`}>{file.fichier_url ? <a href={file.fichier_url} target="_blank" rel="noreferrer" className="rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-black">Ouvrir</a> : <span className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-600">Lien indisponible</span>}{canDelete && <button type="button" disabled={deletingId === file.id} onClick={() => void deleteFile(file)} className="rounded-lg border border-zinc-800 px-3 py-2.5 text-xs font-semibold text-zinc-500 hover:border-red-500/40 hover:text-red-400 disabled:opacity-40">{deletingId === file.id ? "…" : "Supprimer"}</button>}</div>
            </article>;
          })}
        </div>}
      </section>
    </main>
  );
}
