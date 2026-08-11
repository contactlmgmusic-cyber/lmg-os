"use client";

import {
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

type GmailStatus = {
  connected: boolean;
  email: string | null;
  updatedAt: string | null;
};

export default function GoogleGmailConnection() {
  const searchParams =
    useSearchParams();

  const [status, setStatus] =
    useState<GmailStatus>({
      connected: false,
      email: null,
      updatedAt: null,
    });

  const [loading, setLoading] =
    useState(true);

  const [connecting, setConnecting] =
    useState(false);

  const [error, setError] =
    useState("");

  const callbackStatus =
    searchParams.get("googleGmail");

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch(
          "/api/google-gmail/status",
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Impossible de vérifier Gmail."
          );
        }

        setStatus(result);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de vérifier Gmail."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, []);

  async function connectGmail() {
    setConnecting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/google-gmail/connect",
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.url) {
        throw new Error(
          result.error ||
            "Impossible de démarrer la connexion Gmail."
        );
      }

      window.location.href = result.url;
    } catch (connectError) {
      setError(
        connectError instanceof Error
          ? connectError.message
          : "La connexion Gmail a échoué."
      );

      setConnecting(false);
    }
  }

  const callbackMessage =
    callbackStatus === "connected"
      ? "La boîte Gmail centrale LMG est connectée."
      : callbackStatus
      ? "La connexion Gmail a échoué."
      : "";

  const message =
    error || callbackMessage;

  const success =
    !error &&
    callbackStatus === "connected";

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Messagerie externe
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Gmail central LMG
          </h2>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Envoie les communications et
            relances CRM depuis la boîte
            officielle de Legacy Music Group.
          </p>

          <div className="mt-5">
            {loading ? (
              <span className="text-sm text-zinc-500">
                Vérification...
              </span>
            ) : (
              <span
                className={`inline-flex max-w-full rounded-full border px-4 py-2 text-sm font-semibold ${
                  status.connected
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                }`}
              >
                {status.connected
                  ? status.email ||
                    "Connecté"
                  : "Non connecté"}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={connectGmail}
          disabled={
            loading || connecting
          }
          className="w-full shrink-0 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
        >
          {connecting
            ? "Connexion..."
            : status.connected
            ? "Reconnecter Gmail"
            : "Connecter Gmail"}
        </button>
      </div>

      {message && (
        <p
          className={`mt-6 rounded-2xl border p-4 ${
            success
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}