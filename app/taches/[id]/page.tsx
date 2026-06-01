import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

type ChecklistItem = {
  texte?: string;
  done?: boolean;
};

export default async function TacheDetailPage({
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

  const { data: tache, error } = await supabase
    .from("taches")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tache) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <Link href="/taches" className="text-zinc-400 hover:text-white">
          ← Retour aux tâches
        </Link>

        <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
          Tâche introuvable.
        </div>
      </main>
    );
  }

  const { data: responsable } = tache.responsable_id
    ? await supabase
        .from("profiles")
        .select("id, nom, full_name, email, avatar_url, role")
        .eq("id", tache.responsable_id)
        .maybeSingle()
    : { data: null };

  const { data: projet } = tache.projet_id
    ? await supabase
        .from("projets")
        .select("id, titre")
        .eq("id", tache.projet_id)
        .maybeSingle()
    : { data: null };

  const checklist = Array.isArray(tache.checklist)
    ? (tache.checklist as ChecklistItem[])
    : [];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <Link href="/taches" className="text-zinc-400 hover:text-white">
          ← Retour aux tâches
        </Link>

        <Link
          href={`/taches/${tache.id}/modifier`}
          className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
        >
          Modifier
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-5xl font-bold">{tache.titre}</h1>

              <p className="mt-3 text-zinc-400">
                {tache.description || "Aucune description renseignée."}
              </p>
            </div>

            <span className="rounded-full bg-black px-4 py-2 text-sm text-zinc-300">
              {tache.priorite || "Priorité non définie"}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-zinc-500">Statut</p>
              <p className="mt-2 font-semibold">{tache.statut || "À faire"}</p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-zinc-500">Deadline</p>
              <p className="mt-2 font-semibold">
                {tache.deadline || "Non définie"}
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-zinc-500">Projet</p>
              <p className="mt-2 font-semibold">
                {projet?.titre || "Aucun projet lié"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-black p-6">
            <h2 className="mb-4 text-2xl font-bold">Checklist</h2>

            {checklist.length === 0 && (
              <p className="text-sm text-zinc-500">
                Aucune checklist pour cette tâche.
              </p>
            )}

            <div className="space-y-3">
              {checklist.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div
                    className={`h-4 w-4 rounded-full border ${
                      item.done
                        ? "border-green-400 bg-green-400"
                        : "border-zinc-600"
                    }`}
                  />

                  <p
                    className={`text-sm ${
                      item.done ? "text-zinc-500 line-through" : "text-white"
                    }`}
                  >
                    {item.texte || "Élément sans titre"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-5 text-2xl font-bold">Responsable</h2>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-lg font-bold">
                {responsable?.avatar_url ? (
                  <img
                    src={responsable.avatar_url}
                    alt={responsable.nom || responsable.full_name || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  responsable?.nom?.charAt(0)?.toUpperCase() ||
                  responsable?.full_name?.charAt(0)?.toUpperCase() ||
                  "L"
                )}
              </div>

              <div>
                <p className="font-semibold">
                  {responsable?.nom ||
                    responsable?.full_name ||
                    "Non assigné"}
                </p>

                <p className="text-sm text-zinc-500">
                  {responsable?.role || "member"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-5 text-2xl font-bold">Infos</h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-zinc-500">Créée le</p>
                <p>{new Date(tache.created_at).toLocaleDateString("fr-FR")}</p>
              </div>

              <div>
                <p className="text-zinc-500">ID tâche</p>
                <p className="break-all text-zinc-400">{tache.id}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}