"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";


export default function BudgetAllocationChart({
  data,
}: {
  data: any[];
}) {

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Investissements
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Répartition des budgets
        </h2>
      </div>


      <div className="h-[350px]">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={3}
            >

              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}

            </Pie>


            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}