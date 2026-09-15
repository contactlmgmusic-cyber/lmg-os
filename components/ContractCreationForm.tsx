"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { notifyRoles } from "@/lib/notify";

type Artist = { id: string; nom: string };
type Project = { id: string; titre: string; artiste_id: string | null };
const types = ["Contrat artiste", "Contrat booking", "Contrat prestation", "Contrat producteur", "Autre document"];

export default function ContractCreationForm({ artists, projects, loadError }: { artists: Artist[]; projects: Project[]; loadError: string }) {
  const router = useRouter();
  const [title, setTitle] = useState(""); const [type, setType] = useState(types[0]); const [status, setStatus] = useState("Brouillon");
  const [artistId, setArtistId] = useState(""); const [projectId, setProjectId] = useState(""); const [notes, setNotes] = useState("");
  const [fileUrl, setFileUrl] = useState(""); const [fileName, setFileName] = useState(""); const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");
  const availableProjects = useMemo(() => artistId ? projects.filter((item) => item.artiste_id === artistId) : projects, [projects, artistId]);
  const artist = artists.find((item) => item.id === artistId); const project = projects.find((item) => item.id === projectId);
  const valid = title.trim().length > 2 && Boolean(type && (artistId || projectId)) && !uploading;
  function chooseArtist(id: string) { setArtistId(id); if (project?.artiste_id && project.artiste_id !== id) setProjectId(""); setMessage(""); }
  function chooseProject(id: string) { const selected = projects.find((item) => item.id === id); setProjectId(id); if (selected?.artiste_id) setArtistId(selected.artiste_id); setMessage(""); }
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; setMessage("");
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) { setMessage("Le document doit être un fichier PDF."); event.target.value = ""; return; }
    if (file.size > 10 * 1024 * 1024) { setMessage("Le PDF ne doit pas dépasser 10 Mo."); event.target.value = ""; return; }
    setUploading(true); const path = `contrats/${Date.now()}-${crypto.randomUUID()}.pdf`;
    const { error } = await supabaseBrowser.storage.from("lmg-assets").upload(path, file, { contentType: "application/pdf" });
    if (error) { setMessage(error.message); setUploading(false); return; }
    const { data } = supabaseBrowser.storage.from("lmg-assets").getPublicUrl(path); setFileUrl(data.publicUrl); setFileName(file.name); setUploading(false);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!valid || saving) return; setSaving(true); setMessage("");
    if (projectId) { const { data } = await supabaseBrowser.from("projets").select("artiste_id").eq("id", projectId).single(); if (data?.artiste_id && data.artiste_id !== artistId) { setMessage("Le projet n’est plus rattaché à l’artiste sélectionné."); setSaving(false); return; } }
    const { data, error } = await supabaseBrowser.from("contrats").insert({ titre: title.trim(), type, statut: status, artiste_id: artistId || null, projet_id: projectId || null, fichier_url: fileUrl || null, notes: notes.trim() || null }).select("id").single();
    if (error) { setMessage(error.message); setSaving(false); return; }
    await supabaseBrowser.from("activity_logs").insert({ type: "Contrat", titre: "Nouveau contrat ajouté", description: `${title.trim()} • ${status}` });
    await notifyRoles({ roles: ["super_admin", "admin", "manager"], type: "Contrat", titre: "Nouveau contrat ajouté", description: `${title.trim()} • ${status}`, link: `/contrats/${data.id}` });
    router.push(`/contrats/${data.id}`); router.refresh();
  }
  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1300px]">
    <Link href="/contrats" className="text-sm font-semibold text-zinc-500 hover:text-white">← Retour aux contrats</Link>
    <header className="mt-6 border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">LMG Legal</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Nouveau contrat</h1><p className="mt-3 text-zinc-500">Crée un dossier contractuel fiable, rattaché au bon artiste et au bon projet.</p></header>
    {loadError ? <p className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5 text-red-300">Impossible de charger les rattachements.</p> : <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <form onSubmit={submit} className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7"><div className="grid gap-4 sm:grid-cols-2"><Field label="Titre"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Objet du contrat" className="field" /></Field><Field label="Type"><select value={type} onChange={(e) => setType(e.target.value)} className="field">{types.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Statut"><select value={status} onChange={(e) => setStatus(e.target.value)} className="field"><option>Brouillon</option><option>Envoyé</option></select></Field><Field label="Artiste"><select value={artistId} onChange={(e) => chooseArtist(e.target.value)} className="field"><option value="">Aucun artiste</option>{artists.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}</select></Field><Field label="Projet" optional><select value={projectId} onChange={(e) => chooseProject(e.target.value)} className="field"><option value="">Aucun projet</option>{availableProjects.map((item) => <option key={item.id} value={item.id}>{item.titre}</option>)}</select></Field></div><div className="mt-4"><Field label="Notes internes" optional><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contexte, obligations, points de vigilance…" className="field min-h-32 resize-y" /></Field></div><div className="mt-4"><Field label="PDF original" optional><label className="block cursor-pointer rounded-xl border border-dashed border-zinc-700 bg-black p-6 text-center text-sm text-zinc-400 hover:border-zinc-500">{uploading ? "Upload en cours…" : fileName || "Choisir un PDF · 10 Mo maximum"}<input type="file" accept="application/pdf,.pdf" onChange={upload} disabled={uploading} className="hidden" /></label></Field></div>{message && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-sm text-red-300">{message}</p>}<button disabled={!valid || saving} className="mt-6 w-full rounded-xl bg-white px-5 py-4 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-30">{saving ? "Création…" : valid ? "Créer le contrat" : "Ajoute un titre et un rattachement"}</button><style jsx>{`.field{width:100%;min-height:3rem;border:1px solid rgb(39 39 42);border-radius:.75rem;background:#000;padding:.75rem 1rem;color:#fff;outline:none}.field:focus{border-color:rgb(82 82 91)}`}</style></form>
      <aside className="space-y-4"><section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Aperçu du dossier</p><h2 className="mt-3 text-xl font-bold">{title.trim() || "Contrat sans titre"}</h2><p className="mt-1 text-sm text-zinc-500">{type} · {status}</p><div className="mt-5 space-y-3"><Info label="Artiste" value={artist?.nom || "Non lié"} /><Info label="Projet" value={project?.titre || "Non lié"} /><Info label="Document" value={fileName || "Aucun PDF"} /></div></section><section className="rounded-[26px] border border-yellow-500/20 bg-yellow-500/[0.04] p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">Règle juridique</p><p className="mt-3 text-sm leading-6 text-zinc-500">Un contrat est créé en brouillon ou envoyé. La signature et le PDF signé sont archivés ensuite dans l’étape dédiée.</p></section></aside>
    </section>}
  </div></main>;
}
function Field({ label, children, optional = false }: { label: string; children: React.ReactNode; optional?: boolean }) { return <label className="block"><span className="mb-2 block text-xs font-semibold text-zinc-500">{label}{optional ? <span className="font-normal text-zinc-700"> · optionnel</span> : <span className="text-yellow-500"> *</span>}</span>{children}</label>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-zinc-800 bg-black p-4"><p className="text-xs text-zinc-600">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
