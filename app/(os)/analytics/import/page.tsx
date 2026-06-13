"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function ImportAnalyticsPage() {
  const [rows, setRows] = useState<any[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  async function checkAccess() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabaseBrowser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== ROLES.SUPER_ADMIN &&
      profile?.role !== ROLES.ADMIN
    ) {
      window.location.href = "/";
      return;
    }
  }

  checkAccess();
}, []);

function handleFile(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        setRows(results.data as any[]);
      },
    });
  }

  async function handleImport() {
    if (rows.length === 0) return;

    setLoading(true);

    const payload = rows.map((row) => ({
      plateforme: row.plateforme,
      streams: Number(row.streams || 0),
      listeners: Number(row.listeners || 0),
      followers: Number(row.followers || 0),
      vues: Number(row.vues || 0),
      revenus: Number(row.revenus || 0),
      date_snapshot:
        row.date_snapshot ||
        new Date().toISOString().split("T")[0],
    }));

    const { error } = await supabaseBrowser
      .from("analytics")
      .insert(payload);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`${payload.length} lignes importées`);
    setRows([]);
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Analytics Import
        </p>

        <h1 className="text-5xl font-bold">
          Import CSV
        </h1>

        <p className="mt-3 text-zinc-400">
          Importe des données Spotify, YouTube,
          TikTok, Apple Music ou Deezer.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {rows.length > 0 && (
          <>
            <div className="mt-8 overflow-auto rounded-2xl border border-zinc-800">
              <table className="min-w-full text-sm">
                <thead className="bg-black">
                  <tr>
                    {Object.keys(rows[0]).map((key) => (
                      <th
                        key={key}
                        className="border-b border-zinc-800 px-4 py-3 text-left"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value: any, i) => (
                        <td
                          key={i}
                          className="border-b border-zinc-900 px-4 py-3"
                        >
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleImport}
              disabled={loading}
              className="mt-6 rounded-xl bg-white px-6 py-4 font-semibold text-black"
            >
              {loading
                ? "Import en cours..."
                : `Importer ${rows.length} lignes`}
            </button>
          </>
        )}
      </div>
    </main>
  );
}