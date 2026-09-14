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
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-zinc-800 bg-black text-sm font-black">31</div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-bold">Google Calendar</h2>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${connected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"}`}>{loading ? "Vérification" : connected ? "Connecté" : "Non connecté"}</span>
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">Synchronise les échéances LMG avec ton agenda professionnel.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={connectGoogleCalendar}
            disabled={loading}
            className="rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm font-semibold text-white transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
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
          className={`mt-4 rounded-xl border p-3 text-sm ${
            connected
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {statusMessage}
        </p>
      )}

      {syncMessage && (
        <p className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-300">
          {syncMessage}
        </p>
      )}
    </section>
  );
}
