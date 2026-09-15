"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Artist = { id: string; nom: string };
type Project = { id: string; titre: string; artiste_id: string | null };

export default function SplitCreationForm({ artists, projects, userId, loadError }: { artists: Artist[]; projects: Project[]; userId: string; loadError: string }) {
  const router = useRouter();
  const [titre, setTitre] = useState("");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const availableProjects = useMemo(() => projects.filter((project) => project.artiste_id === artisteId), [projects, artisteId]);
  const selectedArtist = artists.find((artist) => artist.id === artisteId);
  const selectedProject = projects.find((project) => project.id === projetId);
  const valid = titre.trim().length > 1 && Boolean(selectedArtist && selectedProject && selectedProject.artiste_id === selectedArtist.id);

  function selectArtist(id: string) {
    setArtisteId(id); setMessage("");
    if (!projects.some((project) => project.id === projetId && project.artiste_id === id)) setProjetId("");
  }
  function selectProject(id: string) {
    const project = projects.find((item) => item.id === id);
    setProjetId(id); setMessage("");
    if (project?.artiste_id) setArtisteId(project.artiste_id);
    if (project && !titre.trim()) setTitre(project.titre);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true); setMessage("");
    const { data: liveProject, error: projectError } = await supabaseBrowser.from("projets").select("id, artiste_id").eq("id", projetId).single();
    if (projectError || !liveProject || liveProject.artiste_id !== artisteId) { setMessage("Le projet sélectionné n’est plus rattaché à cet artiste."); setSaving(false); return; }
    const { data, error } = await supabaseBrowser.from("splits").insert({
      titre: titre.trim(), projet_id: projetId, artiste_id: artisteId,
      notes: notes.trim() || null, statut: "Brouillon", created_by: userId,
    }).select("id").single();
    if (error) { setMessage(error.message); setSaving(false); return; }
    router.push(`/splits/${data.id}/participants/nouveau`); router.refresh();
  }

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1200px]">
    <Link href="/splits" className="text-sm font-semibold text-zinc-500 hover:text-white">← Retour aux split sheets</Link>
    <header className="mt-6 border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Répartition des droits</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Nouveau Split Sheet</h1><p className="mt-3 max-w-3xl text-zinc-500">Crée la fiche liée au bon artiste et au bon projet, puis ajoute immédiatement les bénéficiaires.</p></header>
    {loadError ? <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5 text-red-300">Impossible de charger les artistes et projets.</div> :
    <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <form onSubmit={submit} className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Informations du split</p><h2 className="mt-2 text-2xl font-bold">Œuvre et rattachements</h2>
        <div className="mt-6 space-y-4"><Field label="Artiste"><select value={artisteId} onChange={(e) => selectArtist(e.target.value)} className="field"><option value="">Choisir un artiste</option>{artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.nom}</option>)}</select></Field>
          <Field label="Projet"><select value={projetId} onChange={(e) => selectProject(e.target.value)} disabled={!artisteId} className="field disabled:opacity-40"><option value="">{artisteId ? availableProjects.length ? "Choisir un projet" : "Aucun projet pour cet artiste" : "Choisis d’abord un artiste"}</option>{availableProjects.map((project) => <option key={project.id} value={project.id}>{project.titre}</option>)}</select></Field>
          <Field label="Titre du split sheet"><input value={titre} onChange={(e) => { setTitre(e.target.value); setMessage(""); }} placeholder="Titre de l’œuvre ou de la version" className="field" /></Field>
          <Field label="Notes internes" optional><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contexte, version, accord particulier…" className="field min-h-32 resize-y" /></Field>
        </div>
        {message && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-sm text-red-300">{message}</p>}
        <button type="submit" disabled={!valid || saving} className="mt-6 w-full rounded-xl bg-white px-5 py-4 text-sm font-bold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30">{saving ? "Création…" : valid ? "Créer et ajouter les participants" : "Complète les informations obligatoires"}</button>
        <style jsx>{`.field{width:100%;min-height:3rem;border:1px solid rgb(39 39 42);border-radius:.75rem;background:#000;padding:.75rem 1rem;color:#fff;outline:none}.field:focus{border-color:rgb(82 82 91)}`}</style>
      </form>
      <aside className="space-y-4"><section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Aperçu</p><h2 className="mt-2 text-2xl font-bold">{titre.trim() || "Split sans titre"}</h2><div className="mt-5 space-y-3"><Info label="Artiste" value={selectedArtist?.nom || "À sélectionner"} /><Info label="Projet" value={selectedProject?.titre || "À sélectionner"} /><Info label="Statut initial" value="Brouillon" /></div></section>
        <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Suite du workflow</p><ol className="mt-4 space-y-4 text-sm text-zinc-500"><Step number="1" text="Créer le Split Sheet" active /><Step number="2" text="Ajouter les participants et atteindre 100 %" /><Step number="3" text="Générer les royalties depuis le revenu" /></ol></section>
      </aside>
    </section>}
  </div></main>;
}

function Field({ label, children, optional = false }: { label: string; children: React.ReactNode; optional?: boolean }) { return <label className="block"><span className="mb-2 block text-xs font-semibold text-zinc-500">{label}{optional ? <span className="font-normal text-zinc-700"> · optionnel</span> : <span className="text-yellow-500"> *</span>}</span>{children}</label>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-zinc-800 bg-black p-4"><p className="text-xs text-zinc-600">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function Step({ number, text, active = false }: { number: string; text: string; active?: boolean }) { return <li className="flex items-center gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-yellow-500 text-black" : "bg-zinc-900 text-zinc-500"}`}>{number}</span><span className={active ? "font-semibold text-white" : ""}>{text}</span></li>; }
