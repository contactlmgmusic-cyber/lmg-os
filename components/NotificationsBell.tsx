"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Notification = {
  id: string;
  type: string | null;
  titre: string;
  description: string | null;
  link: string | null;
  lien: string | null;
  lu: boolean | null;
  is_read: boolean | null;
  niveau: string | null;
  created_at: string;
};

function isRead(notification: Notification) {
  return Boolean(notification.lu || notification.is_read);
}

export default function NotificationsBell() {
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] =
    useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(
    async (knownUserId?: string) => {
      let currentUserId = knownUserId;

      if (!currentUserId) {
        const {
          data: { user },
        } = await supabaseBrowser.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        currentUserId = user.id;
        setUserId(user.id);
      }

      const { data } = await supabaseBrowser
        .from("notifications")
        .select(
          "id, type, titre, description, link, lien, lu, is_read, niveau, created_at"
        )
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(30);

      setNotifications((data || []) as Notification[]);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const realtimeChannel = supabaseBrowser
      .channel(`notification-bell-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void loadNotifications(userId);
        }
      )
      .subscribe();

    return () => {
      void supabaseBrowser.removeChannel(realtimeChannel);
    };
  }, [loadNotifications, userId]);

  async function markAsRead(id: string) {
    if (!userId) {
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, lu: true, is_read: true }
          : notification
      )
    );

    await supabaseBrowser
      .from("notifications")
      .update({ lu: true, is_read: true })
      .eq("id", id)
      .eq("user_id", userId);
  }

  async function markAllAsRead() {
    if (!userId) {
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        lu: true,
        is_read: true,
      }))
    );

    await supabaseBrowser
      .from("notifications")
      .update({ lu: true, is_read: true })
      .eq("user_id", userId)
      .or("lu.eq.false,is_read.eq.false");
  }

  const unreadCount = notifications.filter(
    (notification) => !isRead(notification)
  ).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-lg text-white transition hover:border-zinc-600 hover:bg-zinc-900"
        aria-label={`Notifications : ${unreadCount} non lue${unreadCount !== 1 ? "s" : ""}`}
        aria-expanded={open}
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
            {unreadCount > 29 ? "29+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="absolute bottom-full right-0 z-[9999] mb-3 max-h-[72vh] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-950 text-white shadow-2xl shadow-black">
          <header className="flex items-center justify-between gap-4 border-b border-zinc-800 p-4">
            <div>
              <h2 className="font-bold">Notifications</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {unreadCount} à traiter
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-900 hover:text-white"
              aria-label="Fermer les notifications"
            >
              ×
            </button>
          </header>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllAsRead()}
              className="m-4 mb-0 w-[calc(100%-2rem)] rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900"
            >
              Tout marquer comme lu
            </button>
          )}

          <div className="max-h-[52vh] space-y-2 overflow-y-auto p-4">
            {loading && (
              <p className="py-6 text-center text-sm text-zinc-500">
                Chargement...
              </p>
            )}
            {!loading && notifications.length === 0 && (
              <p className="py-6 text-center text-sm text-zinc-500">
                Aucune notification.
              </p>
            )}
            {notifications.map((notification) => {
              const notificationRead = isRead(notification);
              const href =
                notification.link || notification.lien || "/notifications";

              return (
                <Link
                  key={notification.id}
                  href={href}
                  onClick={() => {
                    if (!notificationRead) {
                      void markAsRead(notification.id);
                    }
                    setOpen(false);
                  }}
                  className={`block rounded-2xl border p-3 transition ${
                    notificationRead
                      ? "border-zinc-800 bg-black/60"
                      : "border-cyan-400/25 bg-cyan-400/[0.07]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        notificationRead
                          ? "bg-zinc-700"
                          : notification.niveau === "Urgent"
                            ? "bg-red-400"
                            : notification.niveau === "Important"
                              ? "bg-yellow-400"
                              : "bg-cyan-300"
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {notification.titre || "Notification"}
                      </span>
                      {notification.description && (
                        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-zinc-500">
                          {notification.description}
                        </span>
                      )}
                      <span className="mt-2 block text-[10px] text-zinc-700">
                        {new Date(notification.created_at).toLocaleString(
                          "fr-FR"
                        )}
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <footer className="border-t border-zinc-800 p-3">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-2 text-center text-sm font-bold text-cyan-300 transition hover:bg-zinc-900"
            >
              Ouvrir le centre de notifications
            </Link>
          </footer>
        </section>
      )}
    </div>
  );
}
