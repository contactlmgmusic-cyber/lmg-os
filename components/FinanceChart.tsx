"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


export default function FinanceChart({
  data,
}: {
  data:any[];
}) {

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Evolution financière
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Revenus & dépenses
        </h2>
      </div>


      <div className="h-[350px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="mois" />

            <YAxis />

            <Tooltip />


            <Line
              type="monotone"
              dataKey="revenus"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="depenses"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="resultat"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}