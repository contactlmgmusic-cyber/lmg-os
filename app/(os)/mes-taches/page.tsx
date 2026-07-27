import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MesTachesPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
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
  } = await supabase.auth.getUser();


  const { data: taches, error } = await supabase
    .from("taches")
    .select("*")
    .eq("responsable_id", user?.id)
    .order("deadline", { ascending: true });


  async function deleteTache(formData: FormData) {
    "use server";

    const id = formData.get("id") as string;

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
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
      .delete()
      .eq("id", id);


    redirect("/mesTaches");
  }


  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">
          {error.message}
        </p>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-black p-10 text-white">

      <div className="mb-10">

        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Personal Workspace
        </p>

        <h1 className="text-5xl font-bold">
          Mes tâches
        </h1>

        <p className="mt-3 text-zinc-400">
          Tes tâches assignées, triées par deadline.
        </p>

      </div>



      <div className="space-y-4">

        {(!taches || taches.length === 0) && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-500">
            Aucune tâche assignée.
          </div>
        )}



        {taches?.map((tache) => (

          <div
            key={tache.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600"
          >

            <Link href={`/taches/${tache.id}`}>

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-bold">
                    {tache.titre}
                  </h2>

                  <p className="mt-2 text-zinc-400">
                    {tache.description || "Aucune description"}
                  </p>

                  <p className="mt-4 text-sm text-zinc-500">
                    Deadline : {tache.deadline || "Non renseignée"}
                  </p>

                </div>


                <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                  {tache.statut || "À faire"}
                </span>

              </div>

            </Link>



            <div className="mt-5 flex justify-end">

              <form action={deleteTache}>

                <input
                  type="hidden"
                  name="id"
                  value={tache.id}
                />


                <button
                  type="submit"
                  className="rounded-xl border border-red-500 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20"
                >
                  Supprimer
                </button>


              </form>

            </div>


          </div>

        ))}

      </div>

    </main>
  );
}