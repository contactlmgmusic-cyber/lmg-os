"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Notification = {
  id: string;
  titre: string | null;
  description: string | null;
  type: string | null;
  link: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    setLoading(true);

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data } = await supabaseBrowser
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(data || []);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabaseBrowser
      .from("notifications")
      .update({ is_read: true })
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
      .update({ is_read: true })
      .eq("user_id", user.id);

    await loadNotifications();
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Alerts
          </p>

          <h1 className="text-5xl font-bold">Notifications</h1>

          <p className="mt-3 text-zinc-400">
            {unreadCount} notification(s) non lue(s).
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/notifications/generer"
            className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
          >
            Générer
          </Link>

          <button
            type="button"
            onClick={markAllAsRead}
            className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
          >
            Tout marquer lu
          </button>
        </div>
      </div>

      {loading && <p className="text-zinc-500">Chargement...</p>}

      {!loading && notifications.length === 0 && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
          Aucune notification.
        </div>
      )}

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-3xl border p-6 ${
              notification.is_read
                ? "border-zinc-800 bg-zinc-900"
                : "border-white/30 bg-white/10"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">
                  {notification.type || "notification"}
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {notification.titre || "Notification"}
                </h2>

                <p className="mt-2 text-zinc-400">
                  {notification.description || "Aucun détail."}
                </p>

                {notification.created_at && (
                  <p className="mt-3 text-xs text-zinc-600">
                    {new Date(notification.created_at).toLocaleString("fr-FR")}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                {notification.link && (
                  <Link
                    href={notification.link}
                    className="rounded-xl bg-white px-4 py-2 text-center text-sm font-medium text-black"
                  >
                    Ouvrir
                  </Link>
                )}

                {!notification.is_read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification.id)}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    Marquer lu
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}