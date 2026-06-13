import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ObjectifsPage() {
await requireRole([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
]);

  const { data: objectifs } = await supabase
  .from("objectifs_artistes")
  .select(`
    *,
    artistes (
      id,
      nom
    )
  `)
  .order("created_at", { ascending: false });

const { data: analytics } = await supabase
  .from("analytics")
  .select("*");

const { data: finances } = await supabase
  .from("finances")
  .select("*");

const { data: bookings } = await supabase
  .from("bookings")
  .select("*");

const { data: contrats } = await supabase
  .from("contrats")
  .select("*");

function getAutomaticValue(objectif: any) {
  const artisteId = objectif.artiste_id;

  if (objectif.type === "Streams") {
    return (
      analytics
        ?.filter((item: any) => item.artiste_id === artisteId)
        .reduce((acc: number, item: any) => acc + Number(item.streams || 0), 0) || 0
    );
  }

  if (objectif.type === "Followers") {
    return (
      analytics
        ?.filter((item: any) => item.artiste_id === artisteId)
        .reduce((acc: number, item: any) => acc + Number(item.followers || 0), 0) || 0
    );
  }

  if (objectif.type === "Vues") {
    return (
      analytics
        ?.filter((item: any) => item.artiste_id === artisteId)
        .reduce((acc: number, item: any) => acc + Number(item.vues || 0), 0) || 0
    );
  }

  if (objectif.type === "Revenus") {
    return (
      finances
        ?.filter(
          (item: any) =>
            item.artiste_id === artisteId && item.type === "Revenu"
        )
        .reduce((acc: number, item: any) => acc + Number(item.montant || 0), 0) || 0
    );
  }

  if (objectif.type === "Bookings") {
    return (
      bookings?.filter(
        (item: any) =>
          item.artiste_id === artisteId && item.statut === "Confirmé"
      ).length || 0
    );
  }

  if (objectif.type === "Contrats") {
    return (
      contrats?.filter(
        (item: any) =>
          item.artiste_id === artisteId && item.statut === "Signé"
      ).length || 0
    );
  }

  return Number(objectif.actuel || 0);
}

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Artist Goals
          </p>

          <h1 className="text-5xl font-bold">
            Objectifs artistes
          </h1>
        </div>

        <Link
          href="/objectifs/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black"
        >
          + Nouvel objectif
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {objectifs?.map((objectif: any) => {
          const valeurActuelle = getAutomaticValue(objectif);

const progression =
  objectif.objectif > 0
    ? Math.min(
        100,
        Math.round(
          (valeurActuelle / objectif.objectif) * 100
        )
      )
    : 0;

          return (
            <div
              key={objectif.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">
                    {objectif.artistes?.nom || "Artiste"}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {objectif.type}
                  </h2>
                </div>

                <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm">
                  {objectif.statut}
                </span>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>{valeurActuelle.toLocaleString("fr-FR")}</span>
                  <span>{objectif.objectif}</span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-white"
                    style={{
                      width: `${progression}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-sm text-zinc-500">
                  {progression}% atteint
                </p>
              </div>

              <p className="mt-4 text-sm text-zinc-500">
                Échéance : {objectif.date_limite || "Non définie"}
              </p>
            </div>
          );
        })}

        {(!objectifs || objectifs.length === 0) && (
          <p className="text-zinc-500">
            Aucun objectif créé.
          </p>
        )}
      </div>
    </main>
  );
}