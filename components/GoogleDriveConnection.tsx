"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type DriveStatus = {
  connected: boolean;
  googleEmail: string | null;
  updatedAt: string | null;
};

export default function GoogleDriveConnection() {
  const searchParams = useSearchParams();

  const [status, setStatus] =
    useState<DriveStatus>({
      connected: false,
      googleEmail: null,
      updatedAt: null,
    });

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] =
    useState(false);
  const [message, setMessage] = useState("");

  async function getAccessToken() {
    const {
      data: { session },
    } =
      await supabaseBrowser.auth.getSession();

    return session?.access_token || null;
  }

  async function loadStatus() {
    try {
      const accessToken =
        await getAccessToken();

      if (!accessToken) {
        setMessage(
          "Session utilisateur introuvable."
        );
        return;
      }

      const response = await fetch(
        "/api/google-drive/status",
        {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error ||
            "Impossible de vérifier Google Drive."
        );
        return;
      }

      setStatus(result);
    } catch (error) {
      console.error(
        "Erreur statut Google Drive :",
        error
      );

      setMessage(
        "Impossible de vérifier Google Drive."
      );
    } finally {
      setLoading(false);
    }
  }

  async function connectGoogleDrive() {
    try {
      setConnecting(true);
      setMessage("");

      const accessToken =
        await getAccessToken();

      if (!accessToken) {
        setMessage(
          "Session utilisateur introuvable."
        );
        return;
      }

      const response = await fetch(
        "/api/google-drive/connect",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.url) {
        setMessage(
          result.error ||
            "Impossible de démarrer la connexion Google Drive."
        );
        return;
      }

      window.location.href = result.url;
    } catch (error) {
      console.error(
        "Erreur connexion Google Drive :",
        error
      );

      setMessage(
        "Impossible de démarrer la connexion Google Drive."
      );
    } finally {
      setConnecting(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    const googleDrive =
      searchParams.get("googleDrive");

    if (!googleDrive) return;

    const messages: Record<string, string> = {
      connected:
        "Le Drive central LMG est connecté.",
      "access-denied":
        "L’autorisation Google Drive a été refusée.",
      "invalid-callback":
        "La réponse de Google Drive est invalide.",
      "invalid-state":
        "La connexion Google Drive a expiré. Réessaie.",
      forbidden:
        "Tu n’as pas les droits pour connecter le Drive LMG.",
      "missing-token":
        "Google n’a pas transmis les autorisations nécessaires.",
      "folder-error":
        "Impossible de créer le dossier racine LMG OS.",
      "save-error":
        "Impossible d’enregistrer la connexion Google Drive.",
      "connection-error":
        "La connexion Google Drive a échoué.",
    };

    setMessage(
      messages[googleDrive] ||
        "La connexion Google Drive a échoué."
    );
  }, [searchParams]);

  const successMessage =
    searchParams.get("googleDrive") ===
    "connected";

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Stockage central
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Google Drive LMG
          </h2>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Connecte le compte Google professionnel
            utilisé pour centraliser les documents,
            contrats, contenus et dossiers de LMG.
          </p>

          {!loading && (
            <div className="mt-5">
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
                  status.connected
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                }`}
              >
                {status.connected
                  ? "Drive central connecté"
                  : "Drive non connecté"}
              </span>

              {status.googleEmail && (
                <p className="mt-3 break-all text-sm text-zinc-500">
                  Compte : {status.googleEmail}
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={connectGoogleDrive}
          disabled={connecting || loading}
          className="w-full shrink-0 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
        >
          {connecting
            ? "Connexion..."
            : status.connected
              ? "Reconnecter le Drive"
              : "Connecter Google Drive"}
        </button>
      </div>

      {message && (
        <p
          className={`mt-6 rounded-2xl border p-4 ${
            successMessage
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