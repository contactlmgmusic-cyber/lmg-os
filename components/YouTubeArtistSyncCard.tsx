"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

type YouTubeArtistData = {
  channelId?: string | null;
  url?: string | null;
  title?: string | null;
  imageUrl?: string | null;
  subscribers?: number | null;
  views?: number | null;
  videoCount?: number | null;
  lastSyncedAt?: string | null;
};

function formatNumber(
  value?: number | null
) {
  return Number(
    value || 0
  ).toLocaleString("fr-FR");
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Jamais";
  }

  return new Date(
    value
  ).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function YouTubeArtistSyncCard({
  artisteId,
  youtube,
}: {
  artisteId: string;
  youtube: YouTubeArtistData;
}) {
  const router = useRouter();

  const [channel, setChannel] =
    useState(
      youtube.channelId ||
        youtube.url ||
        ""
    );

  const [syncing, setSyncing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function synchronize(
    event: FormEvent
  ) {
    event.preventDefault();

    const cleanChannel =
      channel.trim();

    if (!cleanChannel) {
      setError(
        "Renseigne une chaîne YouTube."
      );

      return;
    }

    setSyncing(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/youtube/artistes/${artisteId}/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            channel: cleanChannel,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "La synchronisation YouTube a échoué."
        );
      }

      setChannel(
        result.channel?.id ||
          cleanChannel
      );

      setMessage(
        `${result.importedVideos || 0} vidéo${
          result.importedVideos > 1
            ? "s"
            : ""
        } YouTube synchronisée${
          result.importedVideos > 1
            ? "s"
            : ""
        }.`
      );

      router.refresh();
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "La synchronisation YouTube a échoué."
      );
    } finally {
      setSyncing(false);
    }
  }

  const connected =
    Boolean(youtube.channelId);

  return (
    <section className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-5">
          {youtube.imageUrl ? (
            <img
              src={youtube.imageUrl}
              alt={
                youtube.title ||
                "Chaîne YouTube"
              }
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-red-600 text-3xl font-bold text-white">
              ▶
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.3em] text-red-400">
              YouTube
            </p>

            <h2 className="mt-2 truncate text-3xl font-bold">
              {youtube.title ||
                "Associer une chaîne"}
            </h2>

            <p
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                connected
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
              }`}
            >
              {connected
                ? "Chaîne connectée"
                : "Non connectée"}
            </p>

            {youtube.url && (
              <a
                href={youtube.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block text-sm text-zinc-400 hover:text-white"
              >
                Ouvrir la chaîne YouTube →
              </a>
            )}
          </div>
        </div>

        <form
          onSubmit={synchronize}
          className="w-full max-w-xl"
        >
          <label className="mb-2 block text-sm text-zinc-400">
            URL, identifiant, @handle ou
            nom de la chaîne
          </label>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={channel}
              onChange={(event) =>
                setChannel(
                  event.target.value
                )
              }
              placeholder="@artiste ou URL YouTube"
              className="min-w-0 flex-1 rounded-2xl border border-zinc-700 bg-black px-4 py-4 text-white outline-none transition focus:border-red-500"
            />

            <button
              type="submit"
              disabled={
                syncing ||
                !channel.trim()
              }
              className="rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {syncing
                ? "Synchronisation..."
                : connected
                  ? "Resynchroniser"
                  : "Associer"}
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            Pour éviter une mauvaise
            association, utilise de préférence
            l’URL exacte ou l’identifiant de la
            chaîne.
          </p>
        </form>
      </div>

      {connected && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Abonnés"
            value={formatNumber(
              youtube.subscribers
            )}
          />

          <StatCard
            label="Vues de la chaîne"
            value={formatNumber(
              youtube.views
            )}
          />

          <StatCard
            label="Vidéos"
            value={formatNumber(
              youtube.videoCount
            )}
          />

          <StatCard
            label="Dernière synchronisation"
            value={formatDate(
              youtube.lastSyncedAt
            )}
            small
          />
        </div>
      )}

      {message && (
        <p className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-3 font-bold text-white ${
          small
            ? "text-lg"
            : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}