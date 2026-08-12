"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Profile = {
  id: string;
  nom: string | null;
};

type Projet = {
  id: string;
  titre: string | null;
};

export default function NewTaskForm({
  profiles,
  projets,
}: {
  profiles: Profile[];
  projets: Projet[];
}) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("À faire");
  const [priorite, setPriorite] = useState("Moyenne");
  const [deadline, setDeadline] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [projetId, setProjetId] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleParticipant(profileId: string) {
    setParticipantIds((current) =>
      current.includes(profileId)
        ? current.filter((id) => id !== profileId)
        : [...current, profileId]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      const { data: newTask, error: taskError } =
        await supabaseBrowser
          .from("taches")
          .insert({
            titre: titre.trim(),
            description: description.trim(),
            statut,
            priorite,
            deadline: deadline || null,
            responsable_id: responsableId || null,
            projet_id: projetId || null,
          })
          .select("id")
          .single();

      if (taskError || !newTask) {
        throw new Error(
          taskError?.message || "Impossible de créer la tâche."
        );
      }

      const allAssigneeIds = Array.from(
        new Set([
          ...participantIds,
          ...(responsableId ? [responsableId] : []),
        ])
      );

      if (allAssigneeIds.length > 0) {
        const { error: assigneesError } =
          await supabaseBrowser.from("task_assignees").insert(
            allAssigneeIds.map((userId) => ({
              task_id: newTask.id,
              user_id: userId,
            }))
          );

        if (assigneesError) {
          await supabaseBrowser
            .from("taches")
            .delete()
            .eq("id", newTask.id);

          throw new Error(
            `Impossible d’ajouter les participants : ${assigneesError.message}`
          );
        }

        const { error: notificationsError } =
          await supabaseBrowser.from("notifications").insert(
            allAssigneeIds.map((userId) => ({
              user_id: userId,
              type: "tache",
              titre: "Nouvelle tâche assignée",
              description: titre.trim(),
              link: `/taches/${newTask.id}`,
            }))
          );

        if (notificationsError) {
          console.error(
            "Erreur création des notifications :",
            notificationsError
          );
        }
      }

      const { error: activityError } =
        await supabaseBrowser.from("activity_logs").insert({
          type: "Tâche",
          titre: "Nouvelle tâche créée",
          description: titre.trim(),
        });

      if (activityError) {
  console.error(
    "Erreur création du journal d’activité :",
    activityError
  );
}

/*
 * Synchronise immédiatement le calendrier du responsable
 * et de tous les participants ayant connecté Google Calendar.
 * Une erreur de synchronisation ne supprime pas la tâche.
 */
try {
  const {
    data: { session },
  } = await supabaseBrowser.auth.getSession();

  if (!session?.access_token) {
    console.error(
      "Synchronisation Calendar ignorée : session absente."
    );
  } else {
    const syncResponse = await fetch(
      "/api/google-calendar/sync",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          taskId: newTask.id,
        }),
      }
    );

    const syncResult = await syncResponse.json();

    if (!syncResponse.ok) {
      console.error(
        "Erreur synchronisation automatique Calendar :",
        syncResult
      );
    } else {
      console.log(
        "Synchronisation Calendar terminée :",
        syncResult
      );
    }
  }
} catch (syncError) {
  console.error(
    "Impossible de lancer la synchronisation Calendar :",
    syncError
  );
}

window.location.href = "/taches";
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Impossible de créer la tâche."
      );

      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8"
    >
      <input
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder="Titre"
        required
        className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="min-h-40 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="À faire">À faire</option>
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminé</option>
        </select>

        <select
          value={priorite}
          onChange={(e) => setPriorite(e.target.value)}
          className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="Basse">Basse</option>
          <option value="Moyenne">Moyenne</option>
          <option value="Haute">Haute</option>
        </select>

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />
      </div>

      <div>
        <label
          htmlFor="responsable"
          className="mb-2 block text-sm font-medium text-zinc-400"
        >
          Responsable principal
        </label>

        <select
          id="responsable"
          value={responsableId}
          onChange={(e) => setResponsableId(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Aucun responsable principal</option>

          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.nom || "Membre LMG"}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs text-zinc-500">
          Le responsable principal sera automatiquement ajouté aux
          participants.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-black p-5">
        <div className="mb-4">
          <p className="font-semibold text-white">
            Participants concernés
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Sélectionne toutes les personnes qui doivent recevoir cette tâche
            et la retrouver dans leur calendrier.
          </p>
        </div>

        {profiles.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucun membre disponible.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => {
              const isResponsible = responsableId === profile.id;
              const isSelected =
                participantIds.includes(profile.id) || isResponsible;

              return (
                <label
                  key={profile.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    isSelected
                      ? "border-white bg-white/10"
                      : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isResponsible}
                    onChange={() => toggleParticipant(profile.id)}
                    className="h-5 w-5 accent-white"
                  />

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">
                      {profile.nom || "Membre LMG"}
                    </span>

                    {isResponsible && (
                      <span className="mt-1 block text-xs text-zinc-500">
                        Responsable principal
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="projet"
          className="mb-2 block text-sm font-medium text-zinc-400"
        >
          Projet lié
        </label>

        <select
          id="projet"
          value={projetId}
          onChange={(e) => setProjetId(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Aucun projet lié</option>

          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.titre || "Projet sans titre"}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Création..." : "Créer la tâche"}
      </button>
    </form>
  );
}