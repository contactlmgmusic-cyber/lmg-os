import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ModifierTachePage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { id } = params;

  const cookieStore = await cookies();

  const supabase = createServerClient(
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

  const { data: tache } = await supabase
    .from("taches")
    .select("*")
    .eq("id", id)
    .single();

  const { data: profils } = await supabase
    .from("profiles")
    .select("id, nom, role")
    .order("nom", { ascending: true });


  if (!tache) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">
          Tâche introuvable.
        </p>
      </main>
    );
  }


  async function updateTache(formData: FormData) {
    "use server";

    const cookieStore = await cookies();

    const supabase = createServerClient(
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


    await supabase
      .from("taches")
      .update({
        titre: formData.get("titre"),
        description: formData.get("description"),
        statut: formData.get("statut"),
        priorite: formData.get("priorite"),
        deadline:
          formData.get("deadline") || null,
        responsable_id:
          formData.get("responsable_id") || null,
      })
      .eq("id", id);


    redirect(`/taches/${id}`);
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


      <form
        action={updateTache}
        className="max-w-3xl space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
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
              defaultValue={tache.priorite || "Basse"}
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


    </main>
  );
}