import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function MesDocumentsArtistePage() {
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

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, artiste_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== ROLES.ARTISTE || !profile.artiste_id) {
    redirect("/");
  }

  const { data: documents } = await supabase
    .from("artiste_documents")
    .select("*")
    .eq("artiste_id", profile.artiste_id)
    .eq("visible_artiste", true)
    .order("created_at", { ascending: false });

  const documentTypes = [
    "Tous",
    "Contrat",
    "Press Kit",
    "Master",
    "Facture",
    "Visuel",
    "Photo",
    "Administratif",
    "Autre",
  ];

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Mon espace artiste
        </p>

        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">Mon espace · Fichiers</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Mes documents</h1>

        <p className="mt-3 text-zinc-400">
          Retrouve ici les documents partagés par LMG : contrats, press kit,
          masters, visuels, photos et documents administratifs.
        </p>
      </div>

      <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-8">
        {(!documents || documents.length === 0) && (
          <p className="text-zinc-500">Aucun document disponible.</p>
        )}

        {documents && documents.length > 0 && (
          <>
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
              {documentTypes.map((type) => {
                const count =
                  type === "Tous"
                    ? documents.length
                    : documents.filter((doc: any) => doc.type === type).length;

                return (
                  <div
                    key={type}
                    className="rounded-2xl border border-zinc-800 bg-black p-4"
                  >
                    <p className="text-xs text-zinc-500">{type}</p>
                    <p className="mt-2 text-2xl font-bold">{count}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {documents.map((doc: any) => (
                <a
                  key={doc.id}
                  href={doc.fichier_url}
                  target="_blank"
                  className="block rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-600"
                >
                  <p className="text-sm text-blue-300">{doc.type}</p>

                  <h2 className="mt-2 text-xl font-bold">{doc.titre}</h2>

                  <p className="mt-3 text-xs text-zinc-500">
                    Ajouté le{" "}
                    {doc.created_at
                      ? new Date(doc.created_at).toLocaleDateString("fr-FR")
                      : "date inconnue"}
                  </p>

                  <p className="mt-5 text-sm font-medium text-zinc-300">
                    Ouvrir / télécharger →
                  </p>
                </a>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
