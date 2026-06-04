"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Notification = {
  id: string;
  titre: string;
  description: string | null;
  type: string | null;
  lien: string | null;
  lu: boolean;
  created_at: string;
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

    const channel = supabaseBrowser
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.lu)
    .length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white hover:bg-zinc-800"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-96 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
          <h3 className="mb-4 text-lg font-bold text-white">Notifications</h3>

          <div className="space-y-3">
            {notifications.length === 0 && (
              <p className="text-sm text-zinc-500">Aucune notification.</p>
            )}

            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.lien || "#"}
                className={`block rounded-xl border p-4 text-sm transition hover:border-zinc-600 ${
                  notification.lu
                    ? "border-zinc-800 bg-black text-zinc-400"
                    : "border-red-500/40 bg-red-500/10 text-white"
                }`}
              >
                <p className="font-semibold">{notification.titre}</p>

                {notification.description && (
                  <p className="mt-1 text-zinc-400">
                    {notification.description}
                  </p>
                )}

                <p className="mt-2 text-xs text-zinc-600">
                  {new Date(notification.created_at).toLocaleString("fr-FR")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}