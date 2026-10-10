"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";

type AgendaItem = { key: string; title: string; notes?: string; location?: string; start: string; end: string; allDay: boolean; reminderMinutes: number; url: string };

export default function NativeDeviceSettings() {
  const [native, setNative] = useState(false);
  const [busy, setBusy] = useState<"notifications" | "calendar" | "">("");
  const [message, setMessage] = useState("");

  useEffect(() => setNative(Capacitor.isNativePlatform()), []);
  if (!native) return null;

  async function loadAgenda(): Promise<AgendaItem[]> {
    const response = await fetch("/api/mobile/native-agenda", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Agenda indisponible.");
    return payload.items || [];
  }

  async function activateNotifications() {
    setBusy("notifications"); setMessage("");
    try {
      const [{ LocalNotifications }, { PushNotifications }] = await Promise.all([
        import("@capacitor/local-notifications"),
        import("@capacitor/push-notifications"),
      ]);
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== "granted") throw new Error("Autorisation de notification refusée dans les réglages iPhone.");
      const pushPermission = await PushNotifications.requestPermissions();
      if (pushPermission.receive === "granted") await PushNotifications.register();
      const items = await loadAgenda();
      await LocalNotifications.cancelAll();
      const notifications = items.flatMap((item, index) => {
        if (!item.reminderMinutes) return [];
        const at = new Date(item.start).getTime() - item.reminderMinutes * 60_000;
        if (at <= Date.now()) return [];
        return [{ id: 10_000 + index, title: item.title, body: `Dans ${formatDelay(item.reminderMinutes)}`, schedule: { at: new Date(at) }, extra: { url: item.url }, sound: undefined }];
      }).slice(0, 60);
      if (notifications.length) await LocalNotifications.schedule({ notifications });
      setMessage(`Notifications activées · ${notifications.length} rappel(s) programmé(s).`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Activation impossible."); }
    finally { setBusy(""); }
  }

  async function syncCalendar() {
    setBusy("calendar"); setMessage("");
    try {
      const { CapacitorCalendar } = await import("@ebarooni/capacitor-calendar");
      const access = await CapacitorCalendar.requestFullCalendarAccess();
      if (access.result !== "granted") throw new Error("Autorisation Calendrier refusée dans les réglages iPhone.");
      const items = await loadAgenda();
      const calendars = await CapacitorCalendar.listCalendars();
      let calendarId = calendars.result.find((item) => item.title === "LMG Admin")?.id;
      if (!calendarId) {
        const created = await CapacitorCalendar.createCalendar({ title: "LMG Admin", color: "#F2B705" });
        calendarId = created.id;
      }
      const previous = JSON.parse(localStorage.getItem("lmg-native-calendar-events") || "{}") as Record<string, string>;
      for (const id of Object.values(previous)) { try { await CapacitorCalendar.deleteEvent({ id }); } catch {} }
      const next: Record<string, string> = {};
      for (const item of items) {
        const created = await CapacitorCalendar.createEvent({
          title: item.title,
          description: item.notes,
          location: item.location,
          startDate: new Date(item.start).getTime(),
          endDate: new Date(item.end).getTime(),
          isAllDay: item.allDay,
          calendarId,
          alerts: item.reminderMinutes ? [-item.reminderMinutes] : undefined,
          url: `https://os.lmgmusic.fr${item.url}`,
        });
        if (created.id) next[item.key] = created.id;
      }
      localStorage.setItem("lmg-native-calendar-events", JSON.stringify(next));
      setMessage(`Calendrier LMG Admin synchronisé · ${Object.keys(next).length} élément(s).`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Synchronisation impossible."); }
    finally { setBusy(""); }
  }

  return <div className="border-b border-white/[0.06] py-4"><p className="text-sm font-black">iPhone</p><p className="mt-1 text-xs leading-5 text-zinc-600">Agenda personnel et rappels natifs</p><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={activateNotifications} disabled={Boolean(busy)} className="rounded-xl bg-[#f2b705] px-3 py-3 text-xs font-black text-black disabled:opacity-50">{busy === "notifications" ? "Activation…" : "Activer les rappels"}</button><button onClick={syncCalendar} disabled={Boolean(busy)} className="rounded-xl border border-white/10 px-3 py-3 text-xs font-black text-white disabled:opacity-50">{busy === "calendar" ? "Synchronisation…" : "Brancher Calendrier"}</button></div>{message && <p className="mt-3 text-xs leading-5 text-zinc-500">{message}</p>}</div>;
}

function formatDelay(minutes: number) { if (minutes === 1440) return "1 jour"; if (minutes >= 60) return `${minutes / 60} heure${minutes > 60 ? "s" : ""}`; return `${minutes} minutes`; }
