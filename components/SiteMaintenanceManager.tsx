"use client";

import { useEffect, useState } from "react";

type Settings = {
  id: string;
  maintenance_enabled: boolean;
  maintenance_title_fr: string;
  maintenance_title_en: string;
  maintenance_message_fr: string;
  maintenance_message_en: string;
  updated_at: string;
};

export default function SiteMaintenanceManager() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadSettings() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/site-internet/maintenance", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de charger les réglages.");
      }

      setSettings(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger les réglages."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  async function save(nextSettings?: Settings) {
    const payload = nextSettings ?? settings;

    if (!payload) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/site-internet/maintenance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible d’enregistrer.");
      }

      setSettings(data);
      setMessage("Modifications enregistrées.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleMaintenance() {
    if (!settings || saving) return;

    const activating = !settings.maintenance_enabled;

    if (
      activating &&
      !window.confirm(
        "Activer la maintenance du site public LMG Music ? Le site deviendra temporairement inaccessible aux visiteurs."
      )
    ) {
      return;
    }

    const next = {
      ...settings,
      maintenance_enabled: activating,
    };

    setSettings(next);
    await save(next);
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-zinc-900 bg-zinc-950 p-8 text-zinc-500">
        Chargement des réglages…
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-[2rem] border border-red-900/40 bg-red-950/10 p-8">
        <p className="font-semibold text-red-400">
          Impossible de charger les réglages de maintenance.
        </p>

        {message && (
          <p className="mt-3 text-sm text-zinc-500">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => void loadSettings()}
          className="mt-6 rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold transition hover:border-yellow-500"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* STATUS */}
      <section
        className={`rounded-[2rem] border p-7 md:p-8 ${
          settings.maintenance_enabled
            ? "border-yellow-500/40 bg-yellow-500/[0.04]"
            : "border-zinc-900 bg-zinc-950"
        }`}
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  settings.maintenance_enabled
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
                }`}
              />

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                État du site
              </p>
            </div>

            <h2 className="mt-4 text-3xl font-black">
              {settings.maintenance_enabled
                ? "Maintenance active"
                : "Site en ligne"}
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-zinc-500">
              {settings.maintenance_enabled
                ? "Les visiteurs de lmgmusic.fr voient actuellement la page de maintenance. LMG OS reste accessible."
                : "Le site public LMG Music est actuellement accessible normalement."}
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => void toggleMaintenance()}
            className={`shrink-0 rounded-full px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              settings.maintenance_enabled
                ? "border border-zinc-700 text-white hover:border-emerald-500"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
            }`}
          >
            {saving
              ? "Modification…"
              : settings.maintenance_enabled
                ? "Remettre le site en ligne"
                : "Activer la maintenance"}
          </button>
        </div>
      </section>

      {/* CONTENT */}
      <section className="rounded-[2rem] border border-zinc-900 bg-zinc-950 p-7 md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
            Page de maintenance
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Contenu affiché aux visiteurs
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
            Prépare les textes avant d’activer la maintenance. Les versions
            française et anglaise seront utilisées par le site public.
          </p>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          {/* FR */}
          <div className="rounded-2xl border border-zinc-900 bg-black p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
              Français
            </p>

            <label className="mt-6 block">
              <span className="text-sm font-semibold text-zinc-300">
                Titre
              </span>

              <input
                value={settings.maintenance_title_fr}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    maintenance_title_fr: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-300">
                Message
              </span>

              <textarea
                rows={6}
                value={settings.maintenance_message_fr}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    maintenance_message_fr: event.target.value,
                  })
                }
                className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 leading-7 text-white outline-none transition focus:border-yellow-500"
              />
            </label>
          </div>

          {/* EN */}
          <div className="rounded-2xl border border-zinc-900 bg-black p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
              English
            </p>

            <label className="mt-6 block">
              <span className="text-sm font-semibold text-zinc-300">
                Title
              </span>

              <input
                value={settings.maintenance_title_en}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    maintenance_title_en: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-300">
                Message
              </span>

              <textarea
                rows={6}
                value={settings.maintenance_message_en}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    maintenance_message_en: event.target.value,
                  })
                }
                className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 leading-7 text-white outline-none transition focus:border-yellow-500"
              />
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer les textes"}
          </button>

          {message && (
            <p className="text-sm text-zinc-500">
              {message}
            </p>
          )}
        </div>
      </section>

      {/* SAFETY */}
      <section className="rounded-[2rem] border border-zinc-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
          Sécurité
        </p>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-500">
          Le mode maintenance concerne uniquement le site public LMG Music.
          L’accès à os.lmgmusic.fr reste disponible afin que l’équipe puisse
          administrer le site et désactiver la maintenance à tout moment.
        </p>
      </section>
    </div>
  );
}
