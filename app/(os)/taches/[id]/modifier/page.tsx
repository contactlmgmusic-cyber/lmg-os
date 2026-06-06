import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ModifierTachePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
        <p className="text-red-400">Tâche introuvable.</p>
      </main>
    );
  }

  async function updateTache(formData: FormData) {
    "use server";

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

    const titre = formData.get("titre") as string;
    const description = formData.get("description") as string;
    const statut = formData.get("statut") as string;
    const priorite = formData.get("priorite") as string;
    const deadline = formData.get("deadline") as string;
    const responsableId = formData.get("responsable_id") as string;

    await supabase
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

    redirect(`/taches/${id}`);
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <Link href={`/taches/${id}`} className="text-zinc-400 hover:text-white">
          ← Retour à la tâche
        </Link>

        <h1 className="mt-6 text-5xl font-bold">Modifier la tâche</h1>
      </div>

      <form
        action={updateTache}
        className="max-w-3xl space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <div>
          <label className="mb-2 block text-sm text-zinc-400">Titre</label>
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
            <label className="mb-2 block text-sm text-zinc-400">Statut</label>
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
            <label className="mb-2 block text-sm text-zinc-400">Priorité</label>
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
          <label className="mb-2 block text-sm text-zinc-400">Deadline</label>
          <input
            type="date"
            name="deadline"
            defaultValue={tache.deadline || ""}
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
            <option value="">Non assigné</option>

            {profils?.map((profil) => (
              <option key={profil.id} value={profil.id}>
                {profil.nom || "Utilisateur"} — {profil.role || "member"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
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