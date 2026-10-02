"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type JobStatus =
  | "draft"
  | "published"
  | "closed"
  | "archived";

export default function CareersJobActions({
  id,
  status,
}: {
  id: string;
  status: JobStatus;
}) {
  const router = useRouter();

  const [loading, setLoading] =
    useState<JobStatus | null>(null);

  const [error, setError] = useState("");

  async function changeStatus(nextStatus: JobStatus) {
    setLoading(nextStatus);
    setError("");

    try {
      const response = await fetch(
        `/api/careers/jobs/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Impossible de modifier l'offre."
        );
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {status !== "published" && (
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => changeStatus("published")}
            className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
          >
            {loading === "published"
              ? "Publication..."
              : "Publier"}
          </button>
        )}

        {status === "published" && (
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => changeStatus("closed")}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading === "closed"
              ? "Clôture..."
              : "Clôturer"}
          </button>
        )}

        {status !== "draft" &&
          status !== "archived" && (
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => changeStatus("draft")}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              Repasser en brouillon
            </button>
          )}

        {status !== "archived" && (
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => changeStatus("archived")}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium text-muted-foreground disabled:opacity-50"
          >
            {loading === "archived"
              ? "Archivage..."
              : "Archiver"}
          </button>
        )}
      </div>
    </div>
  );
}
