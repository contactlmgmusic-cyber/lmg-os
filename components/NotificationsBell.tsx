"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Notification = {
  id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  task_id: string | null;
};

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  async function loadNotifications() {
    const { data } = await supabaseBrowser
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    setNotifications(data || []);
  }

  useEffect(() => {
    loadNotifications();

    const channel = supabaseBrowser.channel("realtime-notifications");

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
      },
      () => {
        loadNotifications();
      }
    );

    channel.subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((notif) => !notif.is_read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
          <h3 className="mb-3 font-bold text-white">Notifications</h3>

          <div className="space-y-3">
            {notifications.length === 0 && (
              <p className="text-sm text-zinc-500">Aucune notification.</p>
            )}

            {notifications.map((notification) => (
              <a
                key={notification.id}
                href={notification.task_id ? `/taches/${notification.task_id}` : "#"}
                className="block rounded-xl border border-zinc-800 bg-black p-3 text-sm text-white hover:border-zinc-600"
              >
                <p>{notification.message}</p>

                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(notification.created_at).toLocaleString("fr-FR")}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}