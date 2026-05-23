"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type ActivityLog = {
  id: string;
  type: string | null;
  titre: string | null;
  description: string | null;
};

export default function LiveNotifications() {
  const [notification, setNotification] = useState<ActivityLog | null>(null);

  useEffect(() => {
    const channel = supabaseBrowser
      .channel("activity-logs-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_logs",
        },
        (payload) => {
          setNotification(payload.new as ActivityLog);

          setTimeout(() => {
            setNotification(null);
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed right-6 top-6 z-[9999] w-96 rounded-3xl border border-white/20 bg-zinc-950 p-5 text-white shadow-2xl">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
        Nouvelle activité
      </p>

      <h3 className="mt-2 text-lg font-bold">
        {notification.titre}
      </h3>

      <p className="mt-1 text-sm text-zinc-400">
        {notification.description}
      </p>
    </div>
  );
}