"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/roles";

type Candidature = {
  id: string;
  nom_artiste: string | null;
  email: string;
  instagram: string | null;
  lien_musique: string | null;
  message: string | null;
  statut: string | null;
  priorite: string | null;
  assigned_to: string | null;
  note_interne: string | null;
  notes_internes?: string | null;
  prochaine_relance?: string | null;
  potentiel?: string | null;
  ville?: string | null;
  created_at: string;
};

const statuses = [
  "Nouvelle",
  "En étude",
  "Call prévu",
  "Négociation",
  "Signé",
  "Refusé",
];

function normalizeStatus(status?: string | null) {
  if (!status) return "Nouvelle";

  const lower = status.toLowerCase();

  if (lower === "nouvelle") return "Nouvelle";
  if (lower === "en étude") return "En étude";
  if (lower === "entretien") return "Call prévu";
  if (lower === "call prévu") return "Call prévu";
  if (lower === "acceptée") return "Signé";
  if (lower === "signé") return "Signé";
  if (lower === "refusée") return "Refusé";
  if (lower === "refusé") return "Refusé";
if (
  lower === "en etude" ||
  lower === "étude"
) {
  return "En étude";
}

if (
  lower === "call prevu" ||
  lower === "appel prévu" ||
  lower === "appel prevu"
) {
  return "Call prévu";
}

if (
  lower === "negociation" ||
  lower === "négociation"
) {
  return "Négociation";
}

if (
  lower === "acceptee" ||
  lower === "accepte" ||
  lower === "accepté"
) {
  return "Signé";
}

if (
  lower === "refusee" ||
  lower === "refuse"
) {
  return "Refusé";
}

  return status;
}

function getPriorityTone(priority?: string | null) {
  const value = priority?.toLowerCase();

  if (value === "haute") return "border-red-500/40 text-red-300";
  if (value === "faible") return "border-zinc-700 text-zinc-500";

  return "border-yellow-500/40 text-yellow-300";
}

function isOverdueFollowUp(
  date?: string | null,
  status?: string | null
) {
  if (
    !date ||
    ["Signé", "Refusé"].includes(
      normalizeStatus(status)
    )
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const followUpDate = new Date(date);
  followUpDate.setHours(0, 0, 0, 0);

  return followUpDate < today;
}

export default function CandidaturesPage() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function loadCandidatures() {
    const { data, error } = await supabaseBrowser
      .from("candidatures")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setCandidatures(data || []);
    setLoading(false);
  }

  async function updateCandidature(
    id: string,
    updates: Partial<Candidature>
  ) {
    const { error } = await supabaseBrowser
      .from("candidatures")
      .update(updates)
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadCandidatures();
  }

  async function onDragEnd(result: any) {
    if (!result.destination) return;

    const candidatureId = result.draggableId;
    const newStatus = result.destination.droppableId;

    const current = candidatures.find(
      (item) => item.id === candidatureId
    );

    if (!current) return;

    if (normalizeStatus(current.statut) === newStatus) return;

    setCandidatures((items) =>
      items.map((item) =>
        item.id === candidatureId
          ? { ...item, statut: newStatus }
          : item
      )
    );

    await updateCandidature(candidatureId, {
      statut: newStatus,
    });
  }

  useEffect(() => {
  async function checkAccessAndLoad() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabaseBrowser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== ROLES.SUPER_ADMIN &&
      profile?.role !== ROLES.ADMIN
    ) {
      router.push("/dashboard");
      return;
    }

    await loadCandidatures();
  }

  checkAccessAndLoad();
}, [router]);

  const columns = Object.fromEntries(
    statuses.map((status) => [
      status,
      candidatures.filter(
        (candidature) =>
          normalizeStatus(candidature.statut) === status
      ),
    ])
  );

  const nouvelles = columns["Nouvelle"]?.length || 0;
  const enCours =
    (columns["En étude"]?.length || 0) +
    (columns["Call prévu"]?.length || 0) +
    (columns["Négociation"]?.length || 0);
  const signees = columns["Signé"]?.length || 0;
  const refusees = columns["Refusé"]?.length || 0;

  const today = new Date();
today.setHours(0, 0, 0, 0);

const relancesEnRetard = candidatures.filter(
  (candidature) => {
    if (
      !candidature.prochaine_relance ||
      ["Signé", "Refusé"].includes(
        normalizeStatus(candidature.statut)
      )
    ) {
      return false;
    }

    const followUpDate = new Date(
      candidature.prochaine_relance
    );

    followUpDate.setHours(0, 0, 0, 0);

    return followUpDate < today;
  }
).length;

const candidaturesTraitees =
  signees + refusees;

const tauxSignature =
  candidaturesTraitees > 0
    ? Math.round(
        (signees / candidaturesTraitees) * 100
      )
    : 0;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-yellow-500">
          Legacy Music Group
        </p>

        <h1 className="text-5xl font-black">
          CRM Artistes
        </h1>

        <p className="mt-3 text-zinc-400">
          Pipeline des candidatures reçues depuis le site public LMG.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MiniStat label="Nouvelles" value={nouvelles} />
        <MiniStat label="En cours" value={enCours} />
        <MiniStat label="Signées" value={signees} />
        <MiniStat label="Refusées" value={refusees} />
        <MiniStat label="Relances en retard" value={relancesEnRetard} />
        <MiniStat label="Taux de signature" value={`${tauxSignature}%`} />
      </div>

      {loading && (
        <p className="text-zinc-500">
          Chargement...
        </p>
      )}

      {!loading && candidatures.length === 0 && (
        <p className="text-zinc-500">
          Aucune candidature pour le moment.
        </p>
      )}

      {!loading && candidatures.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Object.entries(columns).map(([column, items]: any) => (
              <Droppable droppableId={column} key={column}>
                {(provided) => (
                  <section
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[600px] min-w-[340px] rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-2xl font-bold">
                        {column}
                      </h2>

                      <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                        {items.length}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {items.map(
                        (candidature: Candidature, index: number) => (
                          <Draggable
                            key={candidature.id}
                            draggableId={candidature.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="rounded-2xl border border-zinc-800 bg-black p-5"
                              >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <div>
                                    <h3 className="text-xl font-bold">
                                      {candidature.nom_artiste ||
                                        "Artiste non renseigné"}
                                    </h3>


                                    <Link
  href={`/dashboard/candidatures/${candidature.id}`}
  className="mt-2 inline-block text-sm text-yellow-500 hover:text-yellow-400"
>
  Ouvrir la fiche →
</Link>

                                    <p className="mt-1 text-sm text-zinc-500">
                                      {candidature.ville ||
                                        "Ville non renseignée"}
                                    </p>
                                  </div>

                                  <span
                                    className={`rounded-full border px-2 py-1 text-xs ${getPriorityTone(
                                      candidature.priorite
                                    )}`}
                                  >
                                    {candidature.priorite || "Moyenne"}
                                  </span>
                                </div>

                                <p className="text-sm text-zinc-400">
                                  {candidature.email}
                                </p>

                                {candidature.instagram && (
                                  <p className="mt-2 text-sm text-zinc-500">
                                    Instagram : {candidature.instagram}
                                  </p>
                                )}

                                {candidature.lien_musique && (
                                  <a
                                    href={candidature.lien_musique}
                                    target="_blank"
                                    className="mt-3 block text-sm text-yellow-500 hover:text-yellow-400"
                                  >
                                    Écouter →
                                  </a>
                                )}

                                {candidature.prochaine_relance && (
  <p
    className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
      isOverdueFollowUp(
        candidature.prochaine_relance,
        candidature.statut
      )
        ? "border-red-500/30 bg-red-500/10 text-red-300"
        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
    }`}
  >
    {isOverdueFollowUp(
      candidature.prochaine_relance,
      candidature.statut
    )
      ? "Relance en retard"
      : "Relance prévue"}{" "}
    : {candidature.prochaine_relance}
  </p>
)}

                                <div className="mt-4 grid gap-3">
                                  <select
                                    value={
                                      normalizeStatus(candidature.statut)
                                    }
                                    onChange={(e) =>
                                      updateCandidature(candidature.id, {
                                        statut: e.target.value,
                                      })
                                    }
                                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
                                  >
                                    {statuses.map((status) => (
                                      <option
                                        key={status}
                                        value={status}
                                      >
                                        {status}
                                      </option>
                                    ))}
                                  </select>

                                  <select
                                    value={
                                      candidature.priorite || "Moyenne"
                                    }
                                    onChange={(e) =>
                                      updateCandidature(candidature.id, {
                                        priorite: e.target.value,
                                      })
                                    }
                                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
                                  >
                                    <option value="Haute">Haute</option>
                                    <option value="Moyenne">Moyenne</option>
                                    <option value="Faible">Faible</option>
                                  </select>

                                  <input
                                    type="date"
                                    defaultValue={
                                      candidature.prochaine_relance || ""
                                    }
                                    onBlur={(e) =>
                                      updateCandidature(candidature.id, {
                                        prochaine_relance:
                                          e.target.value || null,
                                      })
                                    }
                                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
                                  />

                                  <textarea
                                    defaultValue={
                                      candidature.notes_internes ||
                                      candidature.note_interne ||
                                      ""
                                    }
                                    placeholder="Note interne..."
                                    rows={3}
                                    onBlur={(e) =>
                                      updateCandidature(candidature.id, {
                                        notes_internes: e.target.value,
                                      })
                                    }
                                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
                                  />
                                </div>

                                <p className="mt-4 text-xs text-zinc-600">
                                  Reçue le{" "}
                                  {new Date(
                                    candidature.created_at
                                  ).toLocaleString("fr-FR")}
                                </p>
                              </div>
                            )}
                          </Draggable>
                        )
                      )}

                      {provided.placeholder}
                    </div>
                  </section>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </main>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-4xl font-bold">
        {value}
      </p>
    </div>
  );
}