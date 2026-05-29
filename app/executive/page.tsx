import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

export default async function ExecutivePage() {
  const monthStart = startOfMonth();

  const { data: finances } = await supabase
    .from("finances")
    .select("*")
    .gte("date_operation", monthStart);

  const revenus = finances?.filter((f: any) => f.type === "Revenu").reduce((a: number, f: any) => a + Number(f.montant || 0), 0) || 0;
  const depenses = finances?.filter((f: any) => f.type === "Dépense").reduce((a: number, f: any) => a + Number(f.montant || 0), 0) || 0;
  const resultat = revenus - depenses;

  const { data: projets } = await supabase.from("projets").select("*").not("date_sortie", "is", null).order("date_sortie", { ascending: true }).limit(6);
  const { data: bookings } = await supabase.from("bookings").select("*").not("date_event", "is", null).order("date_event", { ascending: true }).limit(6);
  const { data: contrats } = await supabase.from("contrats").select("*").neq("statut", "Signé").order("created_at", { ascending: false }).limit(6);
  const { data: taches } = await supabase.from("taches").select("*").eq("priorite", "Haute").neq("statut", "Terminé").order("deadline", { ascending: true }).limit(6);
  const { data: relances } = await supabase.from("bookings").select("*").not("prochaine_relance", "is", null).order("prochaine_relance", { ascending: true }).limit(6);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Executive
        </p>
        <h1 className="text-5xl font-bold">Dashboard Exécutif</h1>
        <p className="mt-3 text-zinc-400">
          Vue CEO : finances, priorités, sorties, bookings et relances.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
          <p className="text-sm text-green-300">CA du mois</p>
          <h2 className="mt-2 text-4xl font-bold">{revenus.toFixed(2)} €</h2>
        </div>

        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-sm text-red-300">Dépenses du mois</p>
          <h2 className="mt-2 text-4xl font-bold">{depenses.toFixed(2)} €</h2>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Résultat du mois</p>
          <h2 className="mt-2 text-4xl font-bold">{resultat.toFixed(2)} €</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Sorties à venir" href="/projets" items={projets || []} labelKey="titre" dateKey="date_sortie" />
        <Panel title="Bookings à venir" href="/booking" items={bookings || []} labelKey="evenement" dateKey="date_event" />
        <Panel title="Contrats à signer" href="/contrats" items={contrats || []} labelKey="titre" dateKey="created_at" />
        <Panel title="Tâches urgentes" href="/taches" items={taches || []} labelKey="titre" dateKey="deadline" />
        <Panel title="Relances booking" href="/booking" items={relances || []} labelKey="evenement" dateKey="prochaine_relance" />
      </div>
    </main>
  );
}

function Panel({
  title,
  href,
  items,
  labelKey,
  dateKey,
}: {
  title: string;
  href: string;
  items: any[];
  labelKey: string;
  dateKey: string;
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Link href={href} className="text-sm text-zinc-400 hover:text-white">
          Voir tout →
        </Link>
      </div>

      <div className="space-y-4">
        {items.length === 0 && <p className="text-zinc-500">Aucun élément.</p>}

        {items.map((item: any) => (
          <div key={item.id} className="rounded-2xl border border-zinc-800 bg-black p-5">
            <h3 className="text-xl font-semibold">{item[labelKey]}</h3>
            <p className="mt-2 text-sm text-zinc-500">
              {item[dateKey] || "Date non renseignée"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}