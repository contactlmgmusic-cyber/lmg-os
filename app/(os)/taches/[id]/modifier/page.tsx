import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
        },
      },
    }
  );
}

export default async function ModifierTachePage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { id } = params;

  const supabase = await getSupabase();

  const {
  data: { user },
} = await supabase.auth.getUser();

console.log("USER CONNECTE :", user?.id);

  const { data: tache, error: tacheError } = await supabase
    .from("taches")
    .select("*")
    .eq("id", id)
    .single();

  if (tacheError) {
    console.error("Erreur récupération tâche :", tacheError);
  }

  const { data: profils, error: profilsError } = await supabase
    .from("profiles")
    .select("id, nom, role")
    .order("nom", { ascending: true });

  if (profilsError) {
    console.error("Erreur récupération profils :", profilsError);
  }

  if (!tache) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">
          Impossible de charger cette tâche.
        </p>
      </main>
    );
  }

  async function updateTache(formData: FormData) {
    "use server";

    const supabase = await getSupabase();

    const titre = String(formData.get("titre") || "");
    const description = String(formData.get("description") || "");
    const statut = String(formData.get("statut") || "À faire");
    const priorite = String(formData.get("priorite") || "Basse");
    const deadline = String(formData.get("deadline") || "");
    const responsableId = String(
      formData.get("responsable_id") || ""
    );

    const { error } = await supabase
      .from("taches")
      .update({
        titre,
        description,
        statut,
        priorite,
        deadline: deadline || null,
        responsable_id: responsableId || null,
      })
      .eq("id", id);

    if (error) {
      console.error("Erreur modification tâche :", error);
      throw new Error("Impossible de modifier la tâche");
    }

    redirect(`/taches/${id}`);
  }

  async function deleteTache() {
    "use server";

    const supabase = await getSupabase();

    const { error } = await supabase
      .from("taches")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur suppression tâche :", error);
      throw new Error("Impossible de supprimer la tâche");
    }

    redirect("/taches");
  }

  const deadlineValue = tache.deadline
    ? new Date(tache.deadline)
        .toISOString()
        .split("T")[0]
    : "";

  return (
    <main className="min-h-screen bg-black p-10 text-white">

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
      </div>


      <div className="max-w-3xl space-y-6">

        <form
          action={updateTache}
          className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
        >

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Titre
            </label>

            <input
              name="titre"
              defaultValue={tache.titre || ""}
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
              defaultValue={tache.description || ""}
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
                defaultValue={tache.statut || "À faire"}
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
              >
                <option value="À faire">À faire</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>


            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Priorité
              </label>

              <select
                name="priorite"
                defaultValue={tache.priorite || "Basse"}
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
              >
                <option value="Basse">Basse</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
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
              defaultValue={deadlineValue}
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
            />
          </div>


          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Responsable
            </label>

            <select
              name="responsable_id"
              defaultValue={tache.responsable_id || ""}
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
            >

              <option value="">
                Non assigné
              </option>

              {profils?.map((profil) => (
                <option
                  key={profil.id}
                  value={profil.id}
                >
                  {profil.nom || "Utilisateur"} — {profil.role || "member"}
                </option>
              ))}

            </select>
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


        <form action={deleteTache}>

          <button
            type="submit"
            className="rounded-xl border border-red-500 bg-red-500/10 px-5 py-3 text-red-300 hover:bg-red-500/20"
          >
            Supprimer définitivement
          </button>

        </form>

      </div>

    </main>
  );
}