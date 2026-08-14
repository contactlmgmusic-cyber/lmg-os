"use client";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";

type ImportResult = {
  importId: string;
  artiste: string;
  rowsImported: number;
  periodStart: string | null;
  periodEnd: string | null;
};

export default function SpotifyAnalyticsImportCard({
  artisteId,
  artisteName,
}: {
  artisteId: string;
  artisteName: string;
}) {
  const [file, setFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState<ImportResult | null>(
      null
    );

  function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setResult(null);

    const selectedFile =
      event.target.files?.[0] ||
      null;

    if (
      selectedFile &&
      !selectedFile.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setFile(null);
      setError(
        "Sélectionne un fichier CSV exporté depuis Spotify for Artists."
      );
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!file) {
      setError(
        "Sélectionne d’abord un fichier CSV."
      );
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData =
        new FormData();

      formData.append(
        "artisteId",
        artisteId
      );

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/spotify/analytics/import",
          {
            method: "POST",
            body: formData,
          }
        );

      const responseData =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            "L’import Spotify a échoué."
        );
      }

      setResult(
        responseData as ImportResult
      );

      setFile(null);

      const fileInput =
        document.getElementById(
          `spotify-analytics-file-${artisteId}`
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "L’import Spotify a échoué."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-green-500/20 bg-zinc-900 p-6 xl:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-green-400">
            Spotify for Artists
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            Importer les analytics
          </h2>

          <p className="mt-3 text-zinc-400">
            Importe un fichier CSV Spotify for Artists pour enregistrer les streams, auditeurs, sauvegardes et ajouts aux playlists de {artisteName}.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl"
        >
          <label
            htmlFor={`spotify-analytics-file-${artisteId}`}
            className="block cursor-pointer rounded-2xl border border-dashed border-zinc-700 bg-black p-5 transition hover:border-green-500/60"
          >
            <span className="block text-sm font-semibold text-white">
              Fichier CSV Spotify
            </span>

            <span className="mt-1 block break-all text-sm text-zinc-500">
              {file
                ? file.name
                : "Cliquer pour sélectionner un fichier CSV"}
            </span>

            <input
              id={`spotify-analytics-file-${artisteId}`}
              type="file"
              accept=".csv,text/csv"
              onChange={
                handleFileChange
              }
              disabled={uploading}
              className="sr-only"
            />
          </label>

          <button
            type="submit"
            disabled={
              uploading || !file
            }
            className="mt-4 w-full rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Import en cours..."
              : "Importer les statistiques"}
          </button>
        </form>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-200">
          <p className="font-semibold">
            Import Spotify terminé
          </p>

          <p className="mt-2 text-sm">
            {result.rowsImported} ligne
            {result.rowsImported > 1
              ? "s"
              : ""}{" "}
            importée
            {result.rowsImported > 1
              ? "s"
              : ""}
            .
          </p>

          {(result.periodStart ||
            result.periodEnd) && (
            <p className="mt-1 text-sm text-emerald-300/80">
              Période :{" "}
              {result.periodStart ||
                "inconnue"}{" "}
              →{" "}
              {result.periodEnd ||
                "inconnue"}
            </p>
          )}
        </div>
      )}
    </section>
  );
}