"use client";

type RevenuePoint = {
  mois: string;
  revenus: number;
  depenses: number;
  resultat: number;
};

export default function RevenueChart({
  data,
}: {
  data: RevenuePoint[];
}) {
  const maxValue = Math.max(
    ...data.map((item) =>
      Math.max(item.revenus, item.depenses, Math.abs(item.resultat))
    ),
    1
  );

  return (
    <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Évolution financière</h2>
        <p className="mt-2 text-zinc-400">
          Revenus, dépenses et résultat sur les derniers mois.
        </p>
      </div>

      {data.length === 0 && (
        <p className="text-zinc-500">Aucune donnée financière.</p>
      )}

      <div className="space-y-5">
        {data.map((item) => (
          <div key={item.mois}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <p className="font-medium text-white">{item.mois}</p>
              <p
                className={
                  item.resultat >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                Résultat : {item.resultat.toFixed(2)} €
              </p>
            </div>

            <div className="space-y-2">
              <Bar
                label="Revenus"
                value={item.revenus}
                maxValue={maxValue}
                tone="green"
              />

              <Bar
                label="Dépenses"
                value={item.depenses}
                maxValue={maxValue}
                tone="red"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Bar({
  label,
  value,
  maxValue,
  tone,
}: {
  label: string;
  value: number;
  maxValue: number;
  tone: "green" | "red";
}) {
  const width = `${Math.max((value / maxValue) * 100, 2)}%`;

  const toneClass =
    tone === "green"
      ? "bg-green-500/70"
      : "bg-red-500/70";

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-zinc-500">
        <span>{label}</span>
        <span>{value.toFixed(2)} €</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-black">
        <div
          className={`h-full rounded-full ${toneClass}`}
          style={{ width }}
        />
      </div>
    </div>
  );
}