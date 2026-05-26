"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Notification = {
  id: string;
  type: string;
  titre: string;
  description: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
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
        .limit(5);

      setNotifications(data || []);
    }

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold">Notifications</p>

        {unreadCount > 0 && (
          <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-black">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 && (
          <p className="text-sm text-zinc-500">Aucune notification.</p>
        )}

        {notifications.map((notification) => (
          <Link
            key={notification.id}
            href={notification.link || "/"}
            className="block rounded-2xl border border-zinc-800 bg-black p-3 hover:border-zinc-600"
          >
            <p className="text-sm font-semibold">{notification.titre}</p>
            {notification.description && (
              <p className="mt-1 text-xs text-zinc-500">
                {notification.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}