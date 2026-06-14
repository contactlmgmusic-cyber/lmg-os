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
  lien: string | null;
  is_read: boolean | null;
  lu: boolean | null;
  niveau: "Urgent" | "Important" | "Info" | null;
  created_at: string | null;
};

type ReadFilter = "all" | "unread" | "read";
type NiveauFilter = "Tous" | "Urgent" | "Important" | "Info";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReadFilter>("all");
  const [niveauFilter, setNiveauFilter] = useState<NiveauFilter>("Tous");

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
      .update({
        is_read: true,
        lu: true,
      })
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
      .update({
        is_read: true,
        lu: true,
      })
      .eq("user_id", user.id);

    await loadNotifications();
  }

  async function deleteNotification(id: string) {
    await supabaseBrowser.from("notifications").delete().eq("id", id);

    await loadNotifications();
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  function isNotificationRead(notification: Notification) {
    return Boolean(notification.is_read || notification.lu);
  }

  const unreadCount = notifications.filter((n) => !isNotificationRead(n)).length;
  const readCount = notifications.filter((n) => isNotificationRead(n)).length;

  const urgentCount = notifications.filter((n) => n.niveau === "Urgent").length;
  const importantCount = notifications.filter(
    (n) => n.niveau === "Important"
  ).length;
  const infoCount = notifications.filter(
    (n) => !n.niveau || n.niveau === "Info"
  ).length;

  const filteredNotifications = notifications.filter((notification) => {
    const read = isNotificationRead(notification);

    if (filter === "unread" && read) return false;
    if (filter === "read" && !read) return false;

    if (niveauFilter !== "Tous") {
      const niveau = notification.niveau || "Info";
      return niveau === niveauFilter;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-start justify-between gap-6">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Alerts
          </p>

          <h1 className="text-5xl font-bold">Centre notifications</h1>

          <p className="mt-3 text-zinc-400">
            {unreadCount} non lue(s), {readCount} lue(s).
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
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

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Toutes" value={notifications.length} />
        <StatCard label="Non lues" value={unreadCount} />
        <StatCard label="Lues" value={readCount} />
        <StatCard label="Urgentes" value={urgentCount} tone="red" />
        <StatCard label="Importantes" value={importantCount} tone="yellow" />
        <StatCard label="Infos" value={infoCount} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          Toutes
        </FilterButton>

        <FilterButton
          active={filter === "unread"}
          onClick={() => setFilter("unread")}
        >
          Non lues
        </FilterButton>

        <FilterButton
          active={filter === "read"}
          onClick={() => setFilter("read")}
        >
          Lues
        </FilterButton>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {(["Tous", "Urgent", "Important", "Info"] as NiveauFilter[]).map(
          (niveau) => (
            <FilterButton
              key={niveau}
              active={niveauFilter === niveau}
              onClick={() => setNiveauFilter(niveau)}
            >
              {niveau}
            </FilterButton>
          )
        )}
      </div>

      {loading && <p className="text-zinc-500">Chargement...</p>}

      {!loading && filteredNotifications.length === 0 && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
          Aucune notification dans ce filtre.
        </div>
      )}

      <div className="space-y-4">
        {filteredNotifications.map((notification) => {
          const read = isNotificationRead(notification);
          const niveau = notification.niveau || "Info";
          const href = notification.link || notification.lien;

          return (
            <div
              key={notification.id}
              className={`rounded-3xl border p-6 ${getNotificationCardClass(
                niveau,
                read
              )}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className={getTypeClass(notification.type)}>
                      {notification.type || "notification"}
                    </span>

                    <span className={getNiveauClass(niveau)}>
                      {niveau}
                    </span>

                    {!read && (
                      <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white">
                        Non lu
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-2xl font-bold">
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
                  {href && (
                    <Link
                      href={href}
                      className="rounded-xl bg-white px-4 py-2 text-center text-sm font-medium text-black"
                    >
                      Ouvrir
                    </Link>
                  )}

                  {!read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                    >
                      Marquer lu
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteNotification(notification.id)}
                    className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "red" | "yellow";
}) {
  const toneClass =
    tone === "red"
      ? "border-red-500/40 bg-red-500/10"
      : tone === "yellow"
      ? "border-yellow-500/40 bg-yellow-500/10"
      : "border-zinc-800 bg-zinc-900";

  return (
    <div className={`rounded-3xl border p-6 ${toneClass}`}>
      <p className="text-sm text-zinc-500">{label}</p>
      <h2 className="mt-2 text-4xl font-bold">{value}</h2>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-5 py-3 text-sm font-medium ${
        active
          ? "bg-white text-black"
          : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}

function getNotificationCardClass(niveau: string, read: boolean) {
  if (niveau === "Urgent") {
    return read
      ? "border-red-500/20 bg-red-500/5"
      : "border-red-500/50 bg-red-500/10";
  }

  if (niveau === "Important") {
    return read
      ? "border-yellow-500/20 bg-yellow-500/5"
      : "border-yellow-500/50 bg-yellow-500/10";
  }

  return read
    ? "border-zinc-800 bg-zinc-900"
    : "border-white/30 bg-white/10";
}

function getNiveauClass(niveau: string) {
  const base = "inline-block rounded-full px-3 py-1 text-xs";

  if (niveau === "Urgent") {
    return `${base} border border-red-500/40 bg-red-500/10 text-red-300`;
  }

  if (niveau === "Important") {
    return `${base} border border-yellow-500/40 bg-yellow-500/10 text-yellow-300`;
  }

  return `${base} border border-zinc-700 bg-zinc-800 text-zinc-300`;
}

function getTypeClass(type: string | null) {
  const base = "inline-block rounded-full px-3 py-1 text-xs";

  if (type === "contract" || type === "Contrat") {
    return `${base} border border-green-500/40 bg-green-500/10 text-green-300`;
  }

  if (type === "booking" || type === "Booking") {
    return `${base} border border-pink-500/40 bg-pink-500/10 text-pink-300`;
  }

  if (type === "project" || type === "Projet" || type === "Sortie") {
    return `${base} border border-violet-500/40 bg-violet-500/10 text-violet-300`;
  }

  if (type === "media" || type === "Média") {
    return `${base} border border-cyan-500/40 bg-cyan-500/10 text-cyan-300`;
  }

  if (type === "royalty" || type === "Royalties") {
    return `${base} border border-yellow-500/40 bg-yellow-500/10 text-yellow-300`;
  }

  if (type === "Validation") {
    return `${base} border border-blue-500/40 bg-blue-500/10 text-blue-300`;
  }

  return `${base} border border-zinc-700 bg-zinc-800 text-zinc-300`;
}