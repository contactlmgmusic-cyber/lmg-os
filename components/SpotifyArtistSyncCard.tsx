"use client";

import {
  useState,
} from "react";

type SpotifyArtistData = {
  id: string;
  name: string;
  url: string | null;
  imageUrl: string | null;
};

export default function SpotifyArtistSyncCard({
  artisteId,
  initialSpotifyArtistId = "",
  initialSpotifyUrl = "",
  initialSpotifyImageUrl = "",
  initialLastSyncedAt = "",
}: {
  artisteId: string;
  initialSpotifyArtistId?: string | null;
  initialSpotifyUrl?: string | null;
  initialSpotifyImageUrl?: string | null;
  initialLastSyncedAt?: string | null;
}) {
  const [
    spotifyValue,
    setSpotifyValue,
  ] = useState(
    initialSpotifyUrl ||
      initialSpotifyArtistId ||
      ""
  );

  const [
    spotifyArtist,
    setSpotifyArtist,
  ] =
    useState<SpotifyArtistData | null>(
      initialSpotifyArtistId
        ? {
            id:
              initialSpotifyArtistId,
            name: "",
            url:
              initialSpotifyUrl ||
              null,
            imageUrl:
              initialSpotifyImageUrl ||
              null,
          }
        : null
    );

  const [
    lastSyncedAt,
    setLastSyncedAt,
  ] = useState(
    initialLastSyncedAt || ""
  );

  const [
    releasesImported,
    setReleasesImported,
  ] =
    useState<number | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  async function synchronizeSpotify() {
    const cleanValue =
      spotifyValue.trim();

    if (!cleanValue) {
      setError(
        "Ajoute le lien du profil Spotify de l’artiste."
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/spotify/artistes/${artisteId}/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            spotifyValue:
              cleanValue,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "La synchronisation Spotify a échoué."
        );
      }

      setSpotifyArtist(
        result.artist
      );

      setLastSyncedAt(
        result.synchronizedAt
      );

      setReleasesImported(
        result.releasesImported
      );

      if (result.artist?.url) {
        setSpotifyValue(
          result.artist.url
        );
      }

      setSuccessMessage(
        `${result.releasesImported} sortie(s) Spotify synchronisée(s).`
      );
    } catch (
      synchronizationError
    ) {
      setError(
        synchronizationError
          instanceof Error
          ? synchronizationError.message
          : "La synchronisation Spotify a échoué."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Connexion externe
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Spotify
          </h2>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Associe le profil Spotify
            officiel de l’artiste pour
            synchroniser son identité et
            sa discographie.
          </p>
        </div>

        {spotifyArtist && (
          <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            Profil associé
          </span>
        )}
      </div>

      {spotifyArtist && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-black p-5 sm:flex-row sm:items-center">
          {spotifyArtist.imageUrl ? (
            <img
              src={
                spotifyArtist.imageUrl
              }
              alt={
                spotifyArtist.name ||
                "Artiste Spotify"
              }
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-800 text-3xl">
              🎧
            </div>
          )}

          <div className="min-w-0">
            {spotifyArtist.name && (
              <p className="truncate text-xl font-bold">
                {
                  spotifyArtist.name
                }
              </p>
            )}

            <p className="mt-1 break-all text-sm text-zinc-500">
              {
                spotifyArtist.id
              }
            </p>

            {spotifyArtist.url && (
              <a
                href={
                  spotifyArtist.url
                }
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-emerald-300 hover:text-emerald-200"
              >
                Ouvrir sur Spotify →
              </a>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <label
          htmlFor={`spotify-${artisteId}`}
          className="mb-2 block text-sm text-zinc-400"
        >
          Lien ou identifiant Spotify
          de l’artiste
        </label>

        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            id={`spotify-${artisteId}`}
            value={spotifyValue}
            onChange={(event) =>
              setSpotifyValue(
                event.target.value
              )
            }
            placeholder="https://open.spotify.com/artist/..."
            className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-white outline-none transition focus:border-emerald-500/60"
          />

          <button
            type="button"
            onClick={
              synchronizeSpotify
            }
            disabled={loading}
            className="rounded-2xl bg-[#1DB954] px-6 py-4 font-bold text-black transition hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Synchronisation..."
              : spotifyArtist
              ? "Actualiser Spotify"
              : "Associer Spotify"}
          </button>
        </div>
      </div>

      {lastSyncedAt && (
        <p className="mt-4 text-xs text-zinc-500">
          Dernière synchronisation :{" "}
          {new Date(
            lastSyncedAt
          ).toLocaleString(
            "fr-FR"
          )}
        </p>
      )}

      {releasesImported !== null &&
        !successMessage && (
          <p className="mt-4 text-sm text-zinc-400">
            {releasesImported} sortie(s)
            trouvée(s).
          </p>
        )}

      {successMessage && (
        <p className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          {successMessage}
        </p>
      )}

      {error && (
        <p className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}