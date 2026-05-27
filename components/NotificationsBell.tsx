"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  titre: string;
  description: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function fetchNotifications() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) return;

    const { data } = await supabaseBrowser
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
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

      await fetchNotifications();

      channel = supabaseBrowser
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
          },
          async (payload) => {
            const newNotification = payload.new as Notification;

            if (newNotification.user_id === user.id) {
              setNotifications((current) => [
                newNotification,
                ...current,
              ]);
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
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) return;

    await supabaseBrowser
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-zinc-800"
      >
        Notifications

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-white px-2 py-1 text-xs font-bold text-black">
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
                href={notification.link || "/"}
                onClick={() => setOpen(false)}
                className={`block rounded-2xl border p-3 ${
                  notification.is_read
                    ? "border-zinc-800 bg-black text-zinc-400"
                    : "border-white/20 bg-white/10 text-white"
                }`}
              >
                <p className="text-sm font-semibold">
                  {notification.titre}
                </p>

                {notification.description && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {notification.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}