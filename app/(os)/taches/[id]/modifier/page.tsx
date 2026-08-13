import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { syncGoogleCalendarForUser } from "@/lib/google-calendar-sync.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

function createSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configuration Supabase indisponible."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function getOrigin() {
  const headersList = await headers();

  const host =
    headersList.get("x-forwarded-host") ||
    headersList.get("host");

  const protocol =
    headersList.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production"
      ? "https"
      : "http");

  if (host) {
    return `${protocol}://${host}`;
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.legacymusicgroup.fr"
  );
}

export default async function ModifierTachePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const supabaseAdmin =
    createSupabaseAdmin();

  const { data: currentProfile } =
    await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

  const allowedRoles: string[] = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.ARTISTIC_DIRECTOR,
  ];

  if (
    !currentProfile ||
    !allowedRoles.includes(
      currentProfile.role
    )
  ) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <p className="text-red-300">
          Accès refusé.
        </p>
      </main>
    );
  }

  const [
    { data: tache, error: taskError },
    { data: profils },
    { data: existingAssignees },
  ] = await Promise.all([
    supabaseAdmin
      .from("taches")
      .select("*")
      .eq("id", id)
      .single(),

    supabaseAdmin
      .from("profiles")
      .select("id, nom, role")
      .order("nom", {
        ascending: true,
      }),

    supabaseAdmin
      .from("task_assignees")
      .select("user_id")
      .eq("task_id", id),
  ]);

  if (taskError || !tache) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <p className="text-zinc-500">
          Tâche introuvable.
        </p>
      </main>
    );
  }

  const selectedParticipantIds =
    new Set(
      (existingAssignees || []).map(
        (assignment) =>
          assignment.user_id
      )
    );

  if (tache.responsable_id) {
    selectedParticipantIds.add(
      tache.responsable_id
    );
  }

  async function updateTache(
    formData: FormData
  ) {
    "use server";

    const actionCookieStore =
      await cookies();

    const actionSupabaseAuth =
      createServerClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return actionCookieStore.getAll();
            },
            setAll() {},
          },
        }
      );

    const {
      data: { user: actionUser },
    } =
      await actionSupabaseAuth.auth.getUser();

    if (!actionUser) {
      redirect("/login");
    }

    const actionSupabaseAdmin =
      createSupabaseAdmin();

    const { data: actionProfile } =
      await actionSupabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", actionUser.id)
        .single();

    const actionAllowedRoles: string[] = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.MANAGER,
      ROLES.ARTISTIC_DIRECTOR,
    ];

    if (
      !actionProfile ||
      !actionAllowedRoles.includes(
        actionProfile.role
      )
    ) {
      throw new Error(
        "Tu n’as pas l’autorisation de modifier cette tâche."
      );
    }

    const responsableId =
      String(
        formData.get(
          "responsable_id"
        ) || ""
      ).trim();

    const participantIds =
      formData
        .getAll("participant_ids")
        .map((value) =>
          String(value)
        )
        .filter(Boolean);

    const newAssigneeIds =
      Array.from(
        new Set([
          ...participantIds,
          ...(responsableId
            ? [responsableId]
            : []),
        ])
      );

    const {
      data: previousAssignments,
      error:
        previousAssignmentsError,
    } = await actionSupabaseAdmin
      .from("task_assignees")
      .select("user_id")
      .eq("task_id", id);

    if (previousAssignmentsError) {
      throw previousAssignmentsError;
    }

    const { data: previousTask } =
      await actionSupabaseAdmin
        .from("taches")
        .select("responsable_id")
        .eq("id", id)
        .single();

    const previousAssigneeIds =
      Array.from(
        new Set([
          ...(previousAssignments || []).map(
            (assignment) =>
              assignment.user_id
          ),
          ...(previousTask?.responsable_id
            ? [
                previousTask.responsable_id,
              ]
            : []),
        ])
      );

    const {
      error: updateTaskError,
    } = await actionSupabaseAdmin
      .from("taches")
      .update({
        titre: String(
          formData.get("titre") || ""
        ).trim(),

        description: String(
          formData.get(
            "description"
          ) || ""
        ).trim(),

        statut: String(
          formData.get("statut") ||
            "À faire"
        ),

        priorite: String(
          formData.get("priorite") ||
            "Moyenne"
        ),

        deadline:
          formData.get("deadline") ||
          null,

        responsable_id:
          responsableId || null,
      })
      .eq("id", id);

    if (updateTaskError) {
      throw updateTaskError;
    }

    const {
      error: deleteAssigneesError,
    } = await actionSupabaseAdmin
      .from("task_assignees")
      .delete()
      .eq("task_id", id);

    if (deleteAssigneesError) {
      throw deleteAssigneesError;
    }

    if (newAssigneeIds.length > 0) {
      const {
        error: insertAssigneesError,
      } = await actionSupabaseAdmin
        .from("task_assignees")
        .insert(
          newAssigneeIds.map(
            (participantId) => ({
              task_id: id,
              user_id: participantId,
            })
          )
        );

      if (insertAssigneesError) {
        throw insertAssigneesError;
      }
    }

    /*
     * On synchronise l’union des anciens et nouveaux participants.
     *
     * Pour un participant ajouté :
     * l’événement est créé.
     *
     * Pour un participant conservé :
     * l’événement est actualisé.
     *
     * Pour un participant retiré :
     * la synchronisation constate que la tâche ne le concerne plus
     * et supprime l’événement de son calendrier.
     */
    const usersToSynchronize =
      Array.from(
        new Set([
          ...previousAssigneeIds,
          ...newAssigneeIds,
        ])
      );

    if (
      usersToSynchronize.length > 0
    ) {
      const {
        data: connections,
        error: connectionsError,
      } = await actionSupabaseAdmin
        .from(
          "google_calendar_connections"
        )
        .select("user_id")
        .in(
          "user_id",
          usersToSynchronize
        );

      if (connectionsError) {
        console.error(
          "Impossible de vérifier les connexions Calendar :",
          connectionsError
        );
      } else {
        const connectedUserIds =
          new Set(
            (connections || []).map(
              (connection) =>
                connection.user_id
            )
          );

        const origin =
          await getOrigin();

        for (
          const participantId of
          usersToSynchronize
        ) {
          if (
            !connectedUserIds.has(
              participantId
            )
          ) {
            continue;
          }

          try {
            await syncGoogleCalendarForUser(
              participantId,
              origin
            );
          } catch (syncError) {
            console.error(
              `Erreur synchronisation Calendar de ${participantId} :`,
              syncError
            );
          }
        }
      }
    }

    redirect(`/taches/${id}`);
  }

  const deadlineValue =
    tache.deadline
      ? new Date(tache.deadline)
          .toISOString()
          .split("T")[0]
      : "";

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mb-10">
        <Link
          href={`/taches/${id}`}
          className="text-zinc-400 hover:text-white"
        >
          ← Retour à la tâche
        </Link>

        <h1 className="mt-6 text-5xl font-bold">
          Modifier la tâche
        </h1>

        <p className="mt-3 text-zinc-400">
          Modifie la tâche, son
          responsable et les personnes
          concernées.
        </p>
      </div>

      <form
        action={updateTache}
        className="max-w-4xl space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Titre
          </label>

          <input
            name="titre"
            defaultValue={
              tache.titre || ""
            }
            required
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Description
          </label>

          <textarea
            name="description"
            defaultValue={
              tache.description || ""
            }
            rows={5}
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Statut
            </label>

            <select
              name="statut"
              defaultValue={
                tache.statut ||
                "À faire"
              }
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
            >
              <option value="À faire">
                À faire
              </option>

              <option value="En cours">
                En cours
              </option>

              <option value="Terminé">
                Terminé
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Priorité
            </label>

            <select
              name="priorite"
              defaultValue={
                tache.priorite ||
                "Moyenne"
              }
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
            >
              <option value="Basse">
                Basse
              </option>

              <option value="Moyenne">
                Moyenne
              </option>

              <option value="Haute">
                Haute
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Deadline
          </label>

          <input
            type="date"
            name="deadline"
            defaultValue={
              deadlineValue
            }
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Responsable principal
          </label>

          <select
            name="responsable_id"
            defaultValue={
              tache.responsable_id ||
              ""
            }
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
          >
            <option value="">
              Non assigné
            </option>

            {profils?.map(
              (profil) => (
                <option
                  key={profil.id}
                  value={profil.id}
                >
                  {profil.nom ||
                    "Utilisateur"}{" "}
                  —{" "}
                  {profil.role ||
                    "member"}
                </option>
              )
            )}
          </select>

          <p className="mt-2 text-xs text-zinc-500">
            Le responsable principal
            sera automatiquement conservé
            parmi les participants.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-black p-5">
          <div className="mb-4">
            <p className="font-semibold">
              Participants concernés
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Les personnes cochées
              retrouveront cette tâche
              dans leur calendrier
              personnel.
            </p>
          </div>

          {!profils ||
          profils.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Aucun utilisateur
              disponible.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {profils.map(
                (profil) => (
                  <label
                    key={profil.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-600"
                  >
                    <input
                      type="checkbox"
                      name="participant_ids"
                      value={profil.id}
                      defaultChecked={selectedParticipantIds.has(
                        profil.id
                      )}
                      className="h-5 w-5 accent-white"
                    />

                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {profil.nom ||
                          "Utilisateur"}
                      </span>

                      <span className="mt-1 block text-xs text-zinc-500">
                        {profil.role ||
                          "Membre LMG"}
                      </span>
                    </span>
                  </label>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link
            href={`/taches/${id}`}
            className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
          >
            Annuler
          </Link>

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </main>
  );
}