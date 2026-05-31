"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Notification = {
  id: string;
  user_id: string;
  type: string | null;
  titre: string | null;
  description: string | null;
  link: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function fetchNotifications(currentUserId?: string) {
    const finalUserId = currentUserId || userId;

    if (!finalUserId) return;

    const { data } = await supabaseBrowser
      .from("notifications")
      .select("*")
      .eq("user_id", finalUserId)
      .order("created_at", { ascending: false })
      .limit(10);

    setNotifications(data || []);
  }

  useEffect(() => {
    let channel: any;

    async function init() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) return;

      setUserId(user.id);
      await fetchNotifications(user.id);

      channel = supabaseBrowser
        .channel(`notifications-bell-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            if (payload.eventType === "INSERT") {
              const newNotification = payload.new as Notification;

              setNotifications((current) => {
                const alreadyExists = current.some(
                  (notification) => notification.id === newNotification.id
                );

                if (alreadyExists) return current;

                return [newNotification, ...current].slice(0, 10);
              });
            }

            if (payload.eventType === "UPDATE") {
              const updatedNotification = payload.new as Notification;

              setNotifications((current) =>
                current.map((notification) =>
                  notification.id === updatedNotification.id
                    ? updatedNotification
                    : notification
                )
              );
            }

            if (payload.eventType === "DELETE") {
              const deletedNotification = payload.old as Notification;

              setNotifications((current) =>
                current.filter(
                  (notification) => notification.id !== deletedNotification.id
                )
              );
            }
          }
        )
        .subscribe();
    }

    init();

    return () => {
      if (channel) {
        supabaseBrowser.removeChannel(channel);
      }
    };
  }, []);

  async function markAllAsRead() {
    if (!userId) return;

    await supabaseBrowser
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  async function markAsRead(id: string) {
    await supabaseBrowser
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification
      )
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-zinc-800"
      >
        Notifications

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-[999] mb-3 w-80 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-white">Notifications</p>

            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Tout lire
            </button>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-sm text-zinc-500">
                Aucune notification.
              </p>
            )}

            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.link || "/notifications"}
                onClick={() => {
                  setOpen(false);
                  markAsRead(notification.id);
                }}
                className={`block rounded-2xl border p-3 ${
                  notification.is_read
                    ? "border-zinc-800 bg-black text-zinc-400"
                    : "border-white/20 bg-white/10 text-white"
                }`}
              >
                <p className="text-xs text-zinc-500">
                  {notification.type || "notification"}
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {notification.titre || "Notification"}
                </p>

                {notification.description && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {notification.description}
                  </p>
                )}
              </Link>
            ))}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-xl border border-zinc-800 px-4 py-3 text-center text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}