"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type NotificationToast = {
  id: string;
  titre: string;
  description: string | null;
  link: string | null;
  lien: string | null;
  niveau: string | null;
};

export default function LiveNotifications() {
  const [notification, setNotification] =
    useState<NotificationToast | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let realtimeChannel: ReturnType<typeof supabaseBrowser.channel> | null =
      null;

    async function subscribe() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        return;
      }

      realtimeChannel = supabaseBrowser
        .channel(`notification-toast-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const incoming = payload.new as NotificationToast;
            setNotification(incoming);

            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
              setNotification(null);
            }, 6000);
          }
        )
        .subscribe();
    }

    void subscribe();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (realtimeChannel) {
        void supabaseBrowser.removeChannel(realtimeChannel);
      }
    };
  }, []);

  if (!notification) {
    return null;
  }

  const href =
    notification.link || notification.lien || "/notifications";

  return (
    <aside className="fixed bottom-5 left-4 right-4 z-[9999] sm:left-auto sm:right-6 sm:w-[390px]">
      <div className="rounded-[22px] border border-cyan-400/25 bg-zinc-950 p-5 text-white shadow-2xl shadow-black">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Nouvelle notification
            </p>
            <h2 className="mt-2 truncate font-bold">
              {notification.titre || "Notification"}
            </h2>
            {notification.description && (
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-400">
                {notification.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-900 hover:text-white"
            aria-label="Fermer la notification"
          >
            ×
          </button>
        </div>
        <Link
          href={href}
          onClick={() => setNotification(null)}
          className="mt-4 block rounded-xl bg-cyan-300 px-4 py-2.5 text-center text-sm font-bold text-cyan-950 transition hover:bg-cyan-200"
        >
          Ouvrir
        </Link>
      </div>
    </aside>
  );
}
