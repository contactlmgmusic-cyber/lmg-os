import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AnalyticsDashboardPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
  ]);

  const { data: analytics } = await supabase
    .from("analytics")
    .select(`
      *,
      artistes ( id, nom ),
      sorties ( id, titre )
    `);

  const rows = analytics || [];

  const totalStreams = rows.reduce(
    (acc: number, row: any) => acc + Number(row.streams || 0),
    0
  );

  const totalFollowers = rows.reduce(
    (acc: number, row: any) => acc + Number(row.followers || 0),
    0
  );

  const totalVues = rows.reduce(
    (acc: number, row: any) => acc + Number(row.vues || 0),
    0
  );

  const totalRevenus = rows.reduce(
    (acc: number, row: any) => acc + Number(row.revenus || 0),
    0
  );

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-10 text-5xl font-bold">
        Analytics Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Kpi title="Streams" value={totalStreams.toLocaleString("fr-FR")} />
        <Kpi title="Followers" value={totalFollowers.toLocaleString("fr-FR")} />
        <Kpi title="Vues" value={totalVues.toLocaleString("fr-FR")} />
        <Kpi title="Revenus" value={`${totalRevenus.toFixed(2)} €`} />
      </div>
    </main>
  );
}

function Kpi({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}