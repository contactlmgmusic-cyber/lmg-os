"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Notification = {
  id: string;
  type: string | null;
  titre: string;
  description: string | null;
  lien: string | null;
  lu: boolean;
  created_at: string;
};

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  async function loadNotifications() {
  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) return;

  const { data } = await supabaseBrowser
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  setNotifications(data || []);
}

  async function markAsRead(id: string) {
    await supabaseBrowser
      .from("notifications")
      .update({ lu: true })
      .eq("id", id);

    await loadNotifications();
  }

  async function markAllAsRead() {
  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) return;

  await supabaseBrowser
    .from("notifications")
    .update({ lu: true })
    .eq("user_id", user.id)
    .eq("lu", false);

  await loadNotifications();
}

  async function deleteNotification(id: string) {
  const { error } = await supabaseBrowser
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadNotifications();
}

  async function openNotification(id: string) {
    await supabaseBrowser
      .from("notifications")
      .update({ lu: true })
      .eq("id", id);

    await loadNotifications();
    setOpen(false);
  }

  useEffect(() => {
    loadNotifications();

    const channel = supabaseBrowser
      .channel("notifications-bell")
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

  const unreadCount = notifications.filter(
    (notification) => !notification.lu
  ).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white hover:bg-zinc-800"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-80 top-24 z-[9999] max-h-[75vh] w-[420px] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Notifications</h3>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-zinc-500 hover:text-white"
            >
              Fermer
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="mb-4 w-full rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Tout marquer comme lu
            </button>
          )}

          <div className="space-y-3">
            {notifications.length === 0 && (
              <p className="text-sm text-zinc-500">
                Aucune notification.
              </p>
            )}

            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border p-4 text-sm transition ${
                  notification.lu
                    ? "border-zinc-800 bg-black text-zinc-400"
                    : "border-red-500/40 bg-red-500/10 text-white"
                }`}
              >
                <Link
                  href={notification.lien || "#"}
                  onClick={() => openNotification(notification.id)}
                  className="block"
                >
                  <p className="font-semibold">
                    {notification.titre}
                  </p>

                  {notification.description && (
                    <p className="mt-1 text-zinc-400">
                      {notification.description}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-zinc-600">
                    {new Date(notification.created_at).toLocaleString("fr-FR")}
                  </p>
                </Link>

                <div className="mt-3 flex gap-2">
                  {!notification.lu && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                    >
                      Marquer comme lu
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteNotification(notification.id)}
                    className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}