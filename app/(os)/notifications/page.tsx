"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
type LevelFilter = "Tous" | "Urgent" | "Important" | "Info";

function isRead(notification: Notification) {
  return Boolean(notification.is_read || notification.lu);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Date indisponible";
  }

  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] =
    useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readFilter, setReadFilter] =
    useState<ReadFilter>("all");
  const [levelFilter, setLevelFilter] =
    useState<LevelFilter>("Tous");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const loadNotifications = useCallback(
    async (knownUserId?: string) => {
      let currentUserId = knownUserId;

      if (!currentUserId) {
        const {
          data: { user },
        } = await supabaseBrowser.auth.getUser();

        if (!user) {
          window.location.href = "/login";
          return;
        }

        currentUserId = user.id;
        setUserId(user.id);
      }

      const { data, error: loadError } = await supabaseBrowser
        .from("notifications")
        .select(
          "id, titre, description, type, link, lien, is_read, lu, niveau, created_at"
        )
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(500);

      if (loadError) {
        setError("Impossible de charger vos notifications.");
      } else {
        setNotifications((data || []) as Notification[]);
      }

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
      .channel(`notifications-${userId}`)
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

  const metrics = useMemo(() => {
    const unread = notifications.filter(
      (notification) => !isRead(notification)
    ).length;
    const urgent = notifications.filter(
      (notification) =>
        notification.niveau === "Urgent" && !isRead(notification)
    ).length;
    const important = notifications.filter(
      (notification) =>
        notification.niveau === "Important" && !isRead(notification)
    ).length;

    return {
      total: notifications.length,
      unread,
      read: notifications.length - unread,
      urgent,
      important,
    };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const notificationRead = isRead(notification);
      const notificationLevel = notification.niveau || "Info";

      if (readFilter === "unread" && notificationRead) {
        return false;
      }

      if (readFilter === "read" && !notificationRead) {
        return false;
      }

      if (
        levelFilter !== "Tous" &&
        notificationLevel !== levelFilter
      ) {
        return false;
      }

      if (
        normalizedSearch &&
        ![
          notification.titre,
          notification.description,
          notification.type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      ) {
        return false;
      }

      return true;
    });
  }, [levelFilter, notifications, readFilter, search]);

  async function updateReadStatus(id: string, read: boolean) {
    if (!userId) {
      return;
    }

    setPendingAction(id);
    setError("");

    const { error: updateError } = await supabaseBrowser
      .from("notifications")
      .update({
        is_read: read,
        lu: read,
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      setError("La notification n’a pas pu être mise à jour.");
    } else {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: read,
                lu: read,
              }
            : notification
        )
      );
    }

    setPendingAction("");
  }

  async function markAllAsRead() {
    if (!userId || metrics.unread === 0) {
      return;
    }

    setPendingAction("all");
    setError("");

    const { error: updateError } = await supabaseBrowser
      .from("notifications")
      .update({
        is_read: true,
        lu: true,
      })
      .eq("user_id", userId)
      .or("is_read.eq.false,lu.eq.false");

    if (updateError) {
      setError("Les notifications n’ont pas pu être mises à jour.");
    } else {
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
          lu: true,
        }))
      );
    }

    setPendingAction("");
  }

  async function deleteNotification(id: string) {
    if (!userId) {
      return;
    }

    setPendingAction(id);
    setError("");

    const { error: deleteError } = await supabaseBrowser
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      setError("La notification n’a pas pu être supprimée.");
    } else {
      setNotifications((current) =>
        current.filter((notification) => notification.id !== id)
      );
    }

    setPendingAction("");
  }

  async function clearReadNotifications() {
    if (
      !userId ||
      metrics.read === 0 ||
      !window.confirm(
        "Supprimer définitivement toutes les notifications déjà lues ?"
      )
    ) {
      return;
    }

    setPendingAction("clear-read");
    setError("");

    const { error: deleteError } = await supabaseBrowser
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .or("is_read.eq.true,lu.eq.true");

    if (deleteError) {
      setError("Les notifications lues n’ont pas pu être supprimées.");
    } else {
      setNotifications((current) =>
        current.filter((notification) => !isRead(notification))
      );
    }

    setPendingAction("");
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 xl:px-10 xl:py-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Communication · Suivi
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              Notifications
            </h1>
            <p className="mt-3 max-w-3xl text-zinc-400">
              Traitez les alertes importantes et retrouvez rapidement les actions qui nécessitent votre attention.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/communication"
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-600"
            >
              Vue globale
            </Link>
            <button
              type="button"
              onClick={() => void clearReadNotifications()}
              disabled={metrics.read === 0 || Boolean(pendingAction)}
              className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Nettoyer les lues
            </button>
            <button
              type="button"
              onClick={() => void markAllAsRead()}
              disabled={metrics.unread === 0 || Boolean(pendingAction)}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pendingAction === "all" ? "Mise à jour..." : "Tout marquer lu"}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold"
              aria-label="Fermer le message d’erreur"
            >
              ×
            </button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="À traiter" value={metrics.unread} accent="cyan" />
          <Metric label="Urgentes" value={metrics.urgent} accent="red" />
          <Metric label="Importantes" value={metrics.important} accent="yellow" />
          <Metric label="Historique total" value={metrics.total} />
        </section>

        <section className="mt-5 rounded-[26px] border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une alerte, un projet ou une action..."
              className="min-w-0 rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-cyan-400/50"
            />
            <div className="flex gap-2 overflow-x-auto">
              {(["all", "unread", "read"] as ReadFilter[]).map((value) => (
                <FilterButton
                  key={value}
                  active={readFilter === value}
                  onClick={() => setReadFilter(value)}
                >
                  {value === "all"
                    ? "Toutes"
                    : value === "unread"
                      ? "Non lues"
                      : "Lues"}
                </FilterButton>
              ))}
            </div>
            <select
              value={levelFilter}
              onChange={(event) =>
                setLevelFilter(event.target.value as LevelFilter)
              }
              className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none focus:border-cyan-400/50"
            >
              <option value="Tous">Toutes les priorités</option>
              <option value="Urgent">Urgentes</option>
              <option value="Important">Importantes</option>
              <option value="Info">Informations</option>
            </select>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[26px] border border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
            <h2 className="font-bold">Boîte de réception</h2>
            <span className="text-xs text-zinc-500">
              {filteredNotifications.length} résultat{filteredNotifications.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading && (
            <div className="p-8 text-sm text-zinc-500">
              Chargement des notifications...
            </div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-semibold text-zinc-300">
                Aucune notification dans ce filtre.
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Vous êtes à jour sur cette sélection.
              </p>
            </div>
          )}

          {!loading && filteredNotifications.length > 0 && (
            <div className="divide-y divide-zinc-800">
              {filteredNotifications.map((notification) => {
                const notificationRead = isRead(notification);
                const level = notification.niveau || "Info";
                const href = notification.link || notification.lien;
                const busy = pendingAction === notification.id;

                return (
                  <article
                    key={notification.id}
                    className={`p-5 transition sm:p-6 ${
                      notificationRead
                        ? "bg-zinc-950 opacity-75"
                        : getUnreadBackground(level)
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={getLevelClass(level)}>
                            {level}
                          </span>
                          <span className="rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-400">
                            {notification.type || "Notification"}
                          </span>
                          {!notificationRead && (
                            <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-bold text-cyan-950">
                              À traiter
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 text-lg font-bold sm:text-xl">
                          {notification.titre || "Notification"}
                        </h3>
                        <p className="mt-2 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                          {notification.description || "Aucun détail disponible."}
                        </p>
                        <p className="mt-3 text-xs text-zinc-600">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {href && (
                          <Link
                            href={href}
                            onClick={() => {
                              if (!notificationRead) {
                                void updateReadStatus(notification.id, true);
                              }
                            }}
                            className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black hover:bg-zinc-200"
                          >
                            Ouvrir
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            void updateReadStatus(
                              notification.id,
                              notificationRead ? false : true
                            )
                          }
                          disabled={busy}
                          className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-900 disabled:opacity-40"
                        >
                          {notificationRead ? "Marquer non lue" : "Marquer lue"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void deleteNotification(notification.id)
                          }
                          disabled={busy}
                          className="rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-40"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "cyan" | "red" | "yellow";
}) {
  const accents = {
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
    red: "border-red-400/25 bg-red-400/10 text-red-300",
    yellow: "border-yellow-400/25 bg-yellow-400/10 text-yellow-300",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? accents[accent]
          : "border-zinc-800 bg-zinc-950 text-white"
      }`}
    >
      <p className="text-sm opacity-65">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
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
      className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-cyan-300 text-cyan-950"
          : "border border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}

function getLevelClass(level: string) {
  const base =
    "rounded-full border px-3 py-1 text-xs font-semibold";

  if (level === "Urgent") {
    return `${base} border-red-500/30 bg-red-500/10 text-red-300`;
  }

  if (level === "Important") {
    return `${base} border-yellow-500/30 bg-yellow-500/10 text-yellow-300`;
  }

  return `${base} border-zinc-700 bg-zinc-900 text-zinc-300`;
}

function getUnreadBackground(level: string) {
  if (level === "Urgent") {
    return "bg-red-500/[0.07]";
  }

  if (level === "Important") {
    return "bg-yellow-500/[0.06]";
  }

  return "bg-cyan-500/[0.04]";
}
