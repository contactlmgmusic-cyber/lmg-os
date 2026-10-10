"use client";

import { useEffect, useState } from "react";

export default function PushNotificationSettings() {
  const [supported, setSupported] = useState(true); const [enabled, setEnabled] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");

  useEffect(() => {
    const available = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(available); if (!available) return;
    navigator.serviceWorker.register("/sw.js").then(async (registration) => setEnabled(Boolean(await registration.pushManager.getSubscription()))).catch(() => setSupported(false));
  }, []);

  async function toggle() {
    setBusy(true); setMessage("");
    try {
      const registration = await navigator.serviceWorker.register("/sw.js"); const existing = await registration.pushManager.getSubscription();
      if (existing) { await fetch("/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: existing.endpoint }) }); await existing.unsubscribe(); setEnabled(false); setMessage("Notifications désactivées sur cet appareil."); return; }
      const permission = await Notification.requestPermission(); if (permission !== "granted") throw new Error("Autorisation refusée. Tu peux la réactiver dans les réglages du téléphone.");
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY; if (!publicKey) throw new Error("Les notifications ne sont pas encore configurées sur le serveur.");
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource });
      const response = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription.toJSON()) }); if (!response.ok) throw new Error("Impossible d’enregistrer cet appareil.");
      setEnabled(true); setMessage("Notifications activées. Un test vient d’être envoyé."); await fetch("/api/push/test", { method: "POST" });
    } catch (failure) { setMessage(failure instanceof Error ? failure.message : "Activation impossible."); }
    finally { setBusy(false); }
  }

  if (!supported) return <div className="border-b border-white/[0.06] py-4"><p className="text-sm font-black">Notifications push</p><p className="mt-1 text-xs leading-5 text-zinc-600">Ajoute LMG ADMIN à l’écran d’accueil puis ouvre l’application installée pour les activer.</p></div>;
  return <div className="border-b border-white/[0.06] py-4"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-black">Notifications push</p><p className="mt-1 text-xs text-zinc-600">{enabled ? "Actives sur cet appareil" : "Recevoir les alertes même quand l’app est fermée"}</p></div><button type="button" disabled={busy} onClick={toggle} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${enabled ? "border border-red-500/30 text-red-400" : "bg-[#f2b705] text-black"}`}>{busy ? "…" : enabled ? "Désactiver" : "Activer"}</button></div>{message && <p className="mt-3 text-xs leading-5 text-zinc-500">{message}</p>}</div>;
}

function urlBase64ToUint8Array(value: string) { const padding = "=".repeat((4 - value.length % 4) % 4); const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/"); const raw = window.atob(base64); return Uint8Array.from([...raw].map((character) => character.charCodeAt(0))); }
