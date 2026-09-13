"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { INTERNAL_PROJECT_POLES } from "@/lib/internal-project-taxonomy";

type InternalProject = {
  id: string;
  titre: string;
  pole: string | null;
  categorie: string | null;
  statut: string;
  priorite: string;
  objectif: string | null;
  owner: { nom?: string | null; full_name?: string | null } | null;
};

export default function InternalProjectsDirectory({ projects }: { projects: InternalProject[] }) {
  const [search, setSearch] = useState("");
  const [pole, setPole] = useState("Tous");
  const [status, setStatus] = useState("Actifs");

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return projects.filter((project) => {
      const matchesSearch = !query || [project.titre, project.objectif, project.categorie, project.pole]
        .some((value) => value?.toLocaleLowerCase("fr").includes(query));
      const matchesPole = pole === "Tous" || (project.pole || "Direction") === pole;
      const matchesStatus = status === "Tous" || (status === "Actifs"
        ? !["Terminé", "Archivé"].includes(project.statut)
        : project.statut === status);
      return matchesSearch && matchesPole && matchesStatus;
    });
  }, [projects, search, pole, status]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, InternalProject[]>>((result, project) => {
      const key = project.pole || "Direction";
      (result[key] ||= []).push(project);
      return result;
    }, {});
  }, [filtered]);

  const orderedPoles = [...INTERNAL_PROJECT_POLES, ...Object.keys(grouped).filter((item) => !INTERNAL_PROJECT_POLES.includes(item as never))]
    .filter((item) => grouped[item]?.length);
  const control = "rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600";

  return <>
    <section className="mb-8 grid gap-3 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-[minmax(0,1fr)_220px_180px]">
      <input value={search} onChange={(event) => setSearch(event.target.value)} className={control} placeholder="Rechercher un projet, un objectif…" aria-label="Rechercher un projet interne" />
      <select value={pole} onChange={(event) => setPole(event.target.value)} className={control} aria-label="Filtrer par pôle">
        <option>Tous</option>{INTERNAL_PROJECT_POLES.map((item) => <option key={item}>{item}</option>)}
      </select>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className={control} aria-label="Filtrer par statut">
        {['Actifs','Tous','À cadrer','Planifié','En cours','En pause','Terminé','Archivé'].map((item) => <option key={item}>{item}</option>)}
      </select>
    </section>

    {!filtered.length ? <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-400">Aucun projet ne correspond à ces filtres.</div> :
      <div className="space-y-10">{orderedPoles.map((poleName) => <section key={poleName}>
        <div className="mb-4 flex items-center gap-4"><h2 className="text-xl font-bold">{poleName}</h2><span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-500">{grouped[poleName].length} projet{grouped[poleName].length > 1 ? "s" : ""}</span><div className="h-px flex-1 bg-zinc-800" /></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{grouped[poleName].map((project) => <ProjectCard key={project.id} project={project} />)}</div>
      </section>)}</div>}
  </>;
}

function ProjectCard({ project }: { project: InternalProject }) {
  return <Link href={`/projets-internes/${project.id}`} className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:-translate-y-0.5 hover:border-zinc-600">
    <div className="flex items-start justify-between gap-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">{project.categorie || "Non classé"}</p><span className="rounded-full bg-black px-3 py-1 text-xs text-zinc-400">{project.statut}</span></div>
    <h3 className="mt-5 text-2xl font-bold transition group-hover:text-yellow-300">{project.titre}</h3>
    <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">{project.objectif || "Objectif à définir."}</p>
    <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4 text-sm"><span className="text-zinc-500">{project.owner?.nom || project.owner?.full_name || "Non attribué"}</span><span className={project.priorite === "Urgente" ? "text-red-400" : project.priorite === "Haute" ? "text-orange-300" : "text-zinc-400"}>{project.priorite}</span></div>
  </Link>;
}
