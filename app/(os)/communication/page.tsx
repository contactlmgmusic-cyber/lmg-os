"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";

type CommunicationStatus =
  | "sent"
  | "failed"
  | "pending"
  | "processing"
  | "cancelled";

type CommunicationItem = {
  id: string;
  source:
    | "history"
    | "scheduled";
  recipient_email: string;
  subject: string;
  message: string;
  entity_type:
    | "media"
    | "influenceur"
    | "partenaire"
    | "prospect"
    | null;
  entity_id: string | null;
  status: CommunicationStatus;
  attempts: number;
  error_message: string | null;
  created_by: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  display_date: string;
};

type Statistics = {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  processing: number;
  cancelled: number;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const EMPTY_STATISTICS: Statistics = {
  total: 0,
  sent: 0,
  failed: 0,
  pending: 0,
  processing: 0,
  cancelled: 0,
};

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Date indisponible";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Date indisponible";
  }

  return date.toLocaleString(
    "fr-FR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function getStatusLabel(
  status: CommunicationStatus
) {
  switch (status) {
    case "sent":
      return "Envoyé";
    case "failed":
      return "Échec";
    case "pending":
      return "Programmé";
    case "processing":
      return "En cours";
    case "cancelled":
      return "Annulé";
    default:
      return status;
  }
}

function getStatusClass(
  status: CommunicationStatus
) {
  switch (status) {
    case "sent":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

    case "failed":
      return "border-red-500/30 bg-red-500/10 text-red-300";

    case "pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";

    case "processing":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";

    case "cancelled":
      return "border-zinc-700 bg-zinc-800 text-zinc-400";

    default:
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
  }
}

function getEntityLabel(
  entityType:
    | CommunicationItem["entity_type"]
) {
  switch (entityType) {
    case "media":
      return "Média";
    case "influenceur":
      return "Influenceur";
    case "partenaire":
      return "Partenaire";
    case "prospect":
      return "Prospect";
    default:
      return "Administration";
  }
}

function getEntityLink(
  item: CommunicationItem
) {
  if (!item.entity_id) {
    return null;
  }

  switch (item.entity_type) {
    case "media":
      return `/medias/${item.entity_id}`;

    case "influenceur":
      return `/influenceurs/${item.entity_id}`;

    case "partenaire":
      return `/partenaires/${item.entity_id}`;

    case "prospect":
      return `/prospects/detail/${item.entity_id}`;

    default:
      return null;
  }
}

export default function CommunicationPage() {
  const [items, setItems] =
    useState<CommunicationItem[]>(
      []
    );

  const [
    statistics,
    setStatistics,
  ] = useState<Statistics>(
    EMPTY_STATISTICS
  );

  const [
    pagination,
    setPagination,
  ] = useState<Pagination>({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 1,
  });

  const [status, setStatus] =
    useState("all");

  const [
    entityType,
    setEntityType,
  ] = useState("all");

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadCommunications =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const params =
          new URLSearchParams({
            status,
            entityType,
            search,
            page: String(page),
            pageSize: "25",
          });

        const response = await fetch(
          `/api/google-gmail/communication-center?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Impossible de charger les communications."
          );
        }

        setItems(
          result.items || []
        );

        setStatistics(
          result.statistics ||
            EMPTY_STATISTICS
        );

        setPagination(
          result.pagination || {
            page: 1,
            pageSize: 25,
            total: 0,
            totalPages: 1,
          }
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les communications."
        );
      } finally {
        setLoading(false);
      }
    }, [
      status,
      entityType,
      search,
      page,
    ]);

  useEffect(() => {
    loadCommunications();
  }, [loadCommunications]);

  function submitSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setPage(1);
    setSearch(
      searchInput.trim()
    );
  }

  function resetFilters() {
    setStatus("all");
    setEntityType("all");
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  const deliveredTotal =
    statistics.sent + statistics.failed;
  const deliveryRate = deliveredTotal
    ? Math.round(
        (statistics.sent / deliveredTotal) * 100
      )
    : 100;
  const activeQueue =
    statistics.pending + statistics.processing;
  const hasIncidents = statistics.failed > 0;

  function showFailedCommunications() {
    setStatus("failed");
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 xl:px-10 xl:py-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-yellow-400">
              Communication · Vue globale
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              Centre de communication
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-400">
              Pilotez les envois, repérez les incidents et accédez à tous les canaux internes depuis un seul écran.
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadCommunications
            }
            disabled={loading}
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Actualisation..."
              : "Actualiser"}
          </button>
        </header>

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Communications"
            value={statistics.total}
            detail="Tous statuts confondus"
            className="border-zinc-800 bg-zinc-950 text-white"
          />

          <StatCard
            label="Taux de délivrance"
            value={`${deliveryRate} %`}
            detail={`${statistics.sent} envoyé${statistics.sent !== 1 ? "s" : ""}`}
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          />

          <StatCard
            label="File active"
            value={activeQueue}
            detail={`${statistics.pending} programmé${statistics.pending !== 1 ? "s" : ""} · ${statistics.processing} en cours`}
            className="border-amber-500/30 bg-amber-500/10 text-amber-300"
          />

          <StatCard
            label="Incidents"
            value={statistics.failed}
            detail={`${statistics.cancelled} annulé${statistics.cancelled !== 1 ? "s" : ""}`}
            className="border-red-500/30 bg-red-500/10 text-red-300"
          />
        </section>

        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <ChannelLink href="/chat" title="Chat d’équipe" description="Échanger dans les canaux partagés" />
          <ChannelLink href="/chat/prive" title="Messages privés" description="Retrouver les conversations directes" />
          <ChannelLink href="/notifications" title="Notifications" description="Traiter les alertes et informations" />
        </section>

        {(hasIncidents || activeQueue > 0) && (
          <section className={`mb-5 rounded-[26px] border p-5 sm:p-6 ${hasIncidents ? "border-red-500/30 bg-red-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${hasIncidents ? "text-red-300" : "text-amber-300"}`}>
                  {hasIncidents ? "Action requise" : "Activité en cours"}
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  {hasIncidents
                    ? `${statistics.failed} communication${statistics.failed !== 1 ? "s" : ""} en échec`
                    : `${activeQueue} communication${activeQueue !== 1 ? "s" : ""} dans la file d’envoi`}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {hasIncidents
                    ? "Consultez les messages d’erreur pour identifier les destinataires à reprendre."
                    : "Les envois programmés ou en traitement sont suivis automatiquement."}
                </p>
              </div>

              {hasIncidents && (
                <button
                  type="button"
                  onClick={showFailedCommunications}
                  className="shrink-0 rounded-xl bg-red-400 px-4 py-2.5 text-sm font-bold text-red-950 transition hover:bg-red-300"
                >
                  Voir les échecs
                </button>
              )}
            </div>
          </section>
        )}

        <section className="mb-5 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 xl:p-6">
          <form
            onSubmit={submitSearch}
            className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,1fr)_220px_220px_auto_auto]"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              placeholder="Destinataire, objet ou contenu..."
              className="min-w-0 rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />

            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value
                );
                setPage(1);
              }}
              className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-zinc-600"
            >
              <option value="all">
                Tous les statuts
              </option>

              <option value="sent">
                Envoyés
              </option>

              <option value="pending">
                Programmés
              </option>

              <option value="processing">
                En cours
              </option>

              <option value="failed">
                Échecs
              </option>

              <option value="cancelled">
                Annulés
              </option>
            </select>

            <select
              value={entityType}
              onChange={(event) => {
                setEntityType(
                  event.target.value
                );
                setPage(1);
              }}
              className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-zinc-600"
            >
              <option value="all">
                Toutes les rubriques
              </option>

              <option value="media">
                Médias
              </option>

              <option value="influenceur">
                Influenceurs
              </option>

              <option value="partenaire">
                Partenaires
              </option>

              <option value="prospect">
                Prospects
              </option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
            >
              Rechercher
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
            >
              Réinitialiser
            </button>
          </form>
        </section>

        {error && (
          <p className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </p>
        )}

        <section className="overflow-hidden rounded-[26px] border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold">
                Communications
              </h2>

              <p className="text-sm text-zinc-500">
                {pagination.total}{" "}
                résultat
                {pagination.total !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          {loading && (
            <div className="p-8 text-zinc-500">
              Chargement des
              communications...
            </div>
          )}

          {!loading &&
            !error &&
            items.length === 0 && (
              <div className="p-8 text-zinc-500">
                Aucune communication ne
                correspond aux filtres.
              </div>
            )}

          {!loading &&
            !error &&
            items.length > 0 && (
              <div className="divide-y divide-zinc-800">
                {items.map((item) => {
                  const entityLink =
                    getEntityLink(item);

                  return (
                    <article
                      key={`${item.source}-${item.id}`}
                      className="p-5 transition hover:bg-white/[0.025] sm:p-6 xl:p-7"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {getStatusLabel(
                                item.status
                              )}
                            </span>

                            <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs text-zinc-400">
                              {getEntityLabel(
                                item.entity_type
                              )}
                            </span>

                            {item.source ===
                              "scheduled" && (
                              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                                Relance automatique
                              </span>
                            )}
                          </div>

                          <p className="mt-4 break-all text-sm text-zinc-500">
                            À :{" "}
                            {
                              item.recipient_email
                            }
                          </p>

                          <h3 className="mt-2 break-words text-xl font-semibold">
                            {item.subject}
                          </h3>

                          <p className="mt-4 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400">
                            {item.message}
                          </p>

                          {item.error_message && (
                            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                              {
                                item.error_message
                              }
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 xl:w-64 xl:text-right">
                          <p className="text-sm font-medium text-zinc-300">
                            {item.status ===
                              "pending"
                              ? "Envoi prévu"
                              : "Date"}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {formatDate(
                              item.display_date
                            )}
                          </p>

                          {item.attempts >
                            0 && (
                            <p className="mt-2 text-xs text-zinc-600">
                              {
                                item.attempts
                              }{" "}
                              tentative
                              {item.attempts >
                              1
                                ? "s"
                                : ""}
                            </p>
                          )}

                          {entityLink && (
                            <a
                              href={entityLink}
                              className="mt-4 inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                            >
                              Ouvrir la fiche
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </section>

        {!loading &&
          !error &&
          pagination.totalPages > 1 && (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                  )
                }
                disabled={
                  pagination.page <= 1
                }
                className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Précédent
              </button>

              <p className="text-center text-sm text-zinc-400">
                Page {pagination.page} sur{" "}
                {pagination.totalPages}
              </p>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      pagination.totalPages,
                      current + 1
                    )
                  )
                }
                disabled={
                  pagination.page >=
                  pagination.totalPages
                }
                className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  detail,
  className,
}: {
  label: string;
  value: number | string;
  detail: string;
  className: string;
}) {
  return (
    <div
      className={`rounded-[26px] border p-5 sm:p-6 ${className}`}
    >
      <p className="text-sm opacity-80">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-xs opacity-65">
        {detail}
      </p>
    </div>
  );
}

function ChannelLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-yellow-400/40 hover:bg-zinc-900"
    >
      <span>
        <span className="block font-semibold text-zinc-100">
          {title}
        </span>
        <span className="mt-1 block text-xs text-zinc-500">
          {description}
        </span>
      </span>
      <span className="text-lg text-zinc-600 transition group-hover:translate-x-1 group-hover:text-yellow-400" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
