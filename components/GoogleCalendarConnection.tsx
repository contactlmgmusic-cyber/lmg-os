"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function GoogleCalendarConnection() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch(
          "/api/google-calendar/status",
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (response.ok) {
          setConnected(Boolean(result.connected));
        }
      } catch (error) {
        console.error(
          "Erreur statut Google Calendar :",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    const params = new URLSearchParams(
      window.location.search
    );

    const googleStatus = params.get("google");

    if (googleStatus === "connected") {
      setStatusMessage(
        "Google Calendar est maintenant connecté."
      );
    }

    if (googleStatus === "connection-error") {
      setStatusMessage(
        "La connexion Google Calendar a échoué."
      );
    }

    if (googleStatus === "invalid-state") {
      setStatusMessage(
        "La demande de connexion a expiré. Réessaie."
      );
    }

    if (googleStatus === "token-error") {
      setStatusMessage(
        "Google n’a pas fourni les autorisations nécessaires."
      );
    }

    if (googleStatus === "save-error") {
      setStatusMessage(
        "Impossible d’enregistrer la connexion Google Calendar."
      );
    }

    loadStatus();
  }, []);

  async function connectGoogleCalendar() {
    setLoading(true);
    setStatusMessage("");
    setSyncMessage("");

    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();

    const accessToken = session?.access_token;

    if (!accessToken) {
      setStatusMessage(
        "Ta session a expiré. Reconnecte-toi à LMG OS."
      );

      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/google-calendar/connect",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.authorizationUrl
      ) {
        setStatusMessage(
          result.error ||
            "Impossible de démarrer la connexion Google."
        );

        setLoading(false);
        return;
      }

      window.location.href =
        result.authorizationUrl;
    } catch (error) {
      console.error(
        "Erreur connexion Google Calendar :",
        error
      );

      setStatusMessage(
        "Impossible de contacter Google Calendar."
      );

      setLoading(false);
    }
  }

  async function syncGoogleCalendar() {
    setSyncing(true);
    setSyncMessage("");

    try {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      const accessToken = session?.access_token;

      if (!accessToken) {
        setSyncMessage(
          "Ta session a expiré. Reconnecte-toi à LMG OS."
        );

        return;
      }

      const response = await fetch(
        "/api/google-calendar/sync",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setSyncMessage(
          result.error ||
            "La synchronisation a échoué."
        );

        return;
      }

      setSyncMessage(
        `Synchronisation terminée : ${result.created} créé(s), ${result.updated} mis à jour, ${result.deleted || 0} supprimé(s).`
      );
    } catch (error) {
      console.error(
        "Erreur synchronisation Google Calendar :",
        error
      );

      setSyncMessage(
        "Impossible de synchroniser Google Calendar."
      );
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className="h-full rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Connexion externe
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Google Calendar
          </h2>

          <p className="mt-4 leading-7 text-zinc-400">
            Connecte ton calendrier LMG pour
            synchroniser uniquement les événements et
            échéances qui te concernent.
          </p>

          <span
            className={`mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
              connected
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
            }`}
          >
            {connected
              ? "Connecté"
              : "Non connecté"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={connectGoogleCalendar}
            disabled={loading}
            className="w-full rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Chargement..."
              : connected
                ? "Reconnecter Google Calendar"
                : "Connecter Google Calendar"}
          </button>

          {connected && (
            <button
              type="button"
              onClick={syncGoogleCalendar}
              disabled={syncing}
              className="w-full rounded-2xl border border-zinc-700 bg-black px-6 py-4 font-semibold text-white transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {syncing
                ? "Synchronisation..."
                : "Synchroniser maintenant"}
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <p
          className={`mt-6 rounded-2xl border p-4 text-sm ${
            connected
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {statusMessage}
        </p>
      )}

      {syncMessage && (
        <p className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
          {syncMessage}
        </p>
      )}
    </section>
  );
}