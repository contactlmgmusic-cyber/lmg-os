import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function PartenaireDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: partenaire, error } = await supabase
    .from("partenaires")
    .select(`
      *,
      artistes ( id, nom ),
      projets ( id, titre )
    `)
    .eq("id", id)
    .single();

  if (error || !partenaire) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">Partenaire introuvable.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href="/partenaires" className="text-sm text-zinc-400 hover:text-white">
        ← Retour CRM Partenaires
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            {partenaire.type}
          </p>

          <h1 className="mt-3 text-5xl font-bold">{partenaire.nom}</h1>

          <span className="mt-6 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            {partenaire.statut || "À contacter"}
          </span>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info label="Email" value={partenaire.email} />
            <Info label="Téléphone" value={partenaire.telephone} />
            <Info label="Instagram" value={partenaire.instagram} />
            <Info label="Site web" value={partenaire.site_web} />
            <Info label="Ville" value={partenaire.ville} />
            <Info
              label="Tarif estimé"
              value={`${Number(partenaire.tarif || 0).toFixed(2)} €`}
            />
            <Info label="Prochaine relance" value={partenaire.prochaine_relance} />
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Notes</h2>
            <p className="mt-4 whitespace-pre-line text-zinc-400">
              {partenaire.notes || "Aucune note renseignée."}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Liens</h2>

            <div className="mt-6 space-y-3">
              {partenaire.artistes && (
                <Link
                  href={`/artistes/${partenaire.artistes.id}`}
                  className="block rounded-xl border border-zinc-700 px-5 py-4 text-zinc-300 hover:bg-zinc-800"
                >
                  Artiste : {partenaire.artistes.nom}
                </Link>
              )}

              {partenaire.projets && (
                <Link
                  href={`/projets/${partenaire.projets.id}`}
                  className="block rounded-xl border border-zinc-700 px-5 py-4 text-zinc-300 hover:bg-zinc-800"
                >
                  Projet : {partenaire.projets.titre}
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Actions</h2>

            <div className="mt-6 space-y-3">
              {partenaire.email && (
                <a
                  href={`mailto:${partenaire.email}`}
                  className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:bg-zinc-200"
                >
                  Envoyer un email
                </a>
              )}

              <Link
                href={`/partenaires/${partenaire.id}/modifier`}
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
              >
                Modifier partenaire
              </Link>

              <Link
                href="/partenaires"
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
              >
                Retour pipeline
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 break-all text-lg font-semibold">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}