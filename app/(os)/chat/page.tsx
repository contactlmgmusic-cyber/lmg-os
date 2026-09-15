"use client";

import Link from "next/link";
import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type CurrentProfile = {
  id: string;
  nom: string | null;
  role: string;
};

type Channel = {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  allowed_roles: string[];
  artiste_id: string | null;
  projet_id: string | null;
};

type Message = {
  id: string;
  channel: string;
  user_id: string | null;
  message: string;
  created_at: string;
  profiles?: {
    nom: string | null;
    role: string | null;
  } | null;
};

function formatMessageDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const sameDay =
    date.toDateString() === today.toDateString();

  return date.toLocaleString("fr-FR", {
    ...(sameDay
      ? {}
      : {
          day: "2-digit",
          month: "short",
        }),
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatContent() {
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] =
    useState<CurrentProfile | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profileData, error: profileError } =
      await supabaseBrowser
        .from("profiles")
        .select("id, nom, role")
        .eq("id", user.id)
        .single();

    if (profileError || !profileData?.role) {
      setError("Impossible de vérifier votre accès au chat.");
      setLoading(false);
      return;
    }

    const currentProfile = profileData as CurrentProfile;
    if (currentProfile.role === "prestataire") {
      window.location.href = "/chat/prive";
      return;
    }
    setProfile(currentProfile);

    const { data: channelData, error: channelError } =
      await supabaseBrowser
        .from("chat_channels")
        .select("id, name, slug, type, allowed_roles, artiste_id, projet_id")
        .contains("allowed_roles", [currentProfile.role])
        .order("created_at", { ascending: true });

    if (channelError) {
      setError("Impossible de charger les canaux autorisés.");
      setLoading(false);
      return;
    }

    const allowedChannels = (channelData || []) as Channel[];
    setChannels(allowedChannels);

    const requestedChannel = searchParams.get("channel");
    const selectedChannel = allowedChannels.some(
      (channel) => channel.slug === requestedChannel
    )
      ? requestedChannel || ""
      : allowedChannels[0]?.slug || "";

    setActiveChannel(selectedChannel);
    setLoading(false);
  }, [searchParams]);

  const fetchMessages = useCallback(
    async (channelSlug: string) => {
      if (!channelSlug) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);
      setError("");

      const { data, error: messagesError } =
        await supabaseBrowser
          .from("chat_messages")
          .select(
            `
              id,
              channel,
              user_id,
              message,
              created_at,
              profiles (
                nom,
                role
              )
            `
          )
          .eq("channel", channelSlug)
          .order("created_at", { ascending: true })
          .limit(500);

      if (messagesError) {
        setMessages([]);
        setError("Impossible de charger les messages de ce canal.");
      } else {
        setMessages((data || []) as unknown as Message[]);
      }

      setLoadingMessages(false);
    },
    []
  );

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!activeChannel) {
      setMessages([]);
      return;
    }

    void fetchMessages(activeChannel);

    const realtimeChannel = supabaseBrowser
      .channel(`chat-live-${activeChannel}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `channel=eq.${activeChannel}`,
        },
        () => {
          void fetchMessages(activeChannel);
        }
      )
      .subscribe();

    return () => {
      void supabaseBrowser.removeChannel(realtimeChannel);
    };
  }, [activeChannel, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  const activeChannelData = channels.find(
    (channel) => channel.slug === activeChannel
  );
  const isManager = profile?.role === "manager";
  const isArtist = profile?.role === "artiste";
  const workspaceTitle = isManager ? "Chats de mes artistes" : isArtist ? "Chat avec mon équipe" : "Chat d’équipe";
  const workspaceDescription = isManager
    ? "Uniquement les canaux rattachés à vos artistes et à leurs projets."
    : isArtist
      ? "Les échanges liés à votre carrière et à vos projets avec l’équipe qui vous accompagne."
      : "Les décisions collectives, les informations de projet et les échanges opérationnels LMG.";

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return messages;
    }

    return messages.filter((item) =>
      [item.message, item.profiles?.nom, item.profiles?.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [messages, search]);

  function changeChannel(slug: string) {
    if (!channels.some((channel) => channel.slug === slug)) {
      return;
    }

    setSearch("");
    setActiveChannel(slug);
    window.history.replaceState(null, "", `/chat?channel=${slug}`);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (
      !cleanMessage ||
      !profile ||
      !activeChannelData ||
      sending
    ) {
      return;
    }

    if (cleanMessage.length > 2000) {
      setError("Le message ne peut pas dépasser 2 000 caractères.");
      return;
    }

    setSending(true);
    setError("");

    const { error: messageError } = await supabaseBrowser
      .from("chat_messages")
      .insert({
        channel: activeChannelData.slug,
        user_id: profile.id,
        message: cleanMessage,
      });

    if (messageError) {
      setError("Le message n’a pas pu être envoyé.");
      setSending(false);
      return;
    }

    setMessage("");

    setSending(false);
  }

  async function deleteMessage(messageId: string) {
    if (!window.confirm("Supprimer définitivement ce message ?")) {
      return;
    }

    const { error: deleteError } = await supabaseBrowser
      .from("chat_messages")
      .delete()
      .eq("id", messageId);

    if (deleteError) {
      setError("Le message n’a pas pu être supprimé.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-[1500px] rounded-[26px] border border-zinc-800 bg-zinc-950 p-8 text-zinc-500">
          Chargement du chat d’équipe...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 xl:px-10 xl:py-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-yellow-400">
              Communication · Équipe
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              {workspaceTitle}
            </h1>
            <p className="mt-3 text-zinc-400">
              {workspaceDescription}
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {!isManager && !isArtist && <Link
              href="/communication"
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600"
            >
              Vue globale
            </Link>}
            <Link
              href="/chat/prive"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              Messages privés
            </Link>
          </nav>
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

        <div className="grid min-h-[680px] gap-4 xl:h-[calc(100vh-220px)] xl:min-h-[620px] xl:grid-cols-[290px_1fr]">
          <aside className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold">Canaux</h2>
              <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-zinc-500">
                {channels.length}
              </span>
            </div>

            {channels.length === 0 ? (
              <p className="mt-5 text-sm text-zinc-500">
                Aucun canal accessible avec votre rôle.
              </p>
            ) : (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-2 xl:overflow-visible">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => changeChannel(channel.slug)}
                    className={`min-w-fit rounded-2xl px-4 py-3 text-left transition xl:w-full ${
                      activeChannel === channel.slug
                        ? "bg-yellow-400 font-bold text-black"
                        : "border border-zinc-800 bg-black text-zinc-300 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    <span className="block">#{channel.name}</span>
                    <span
                      className={`mt-1 block text-xs ${
                        activeChannel === channel.slug
                          ? "text-black/60"
                          : "text-zinc-600"
                      }`}
                    >
                      {channel.type || "général"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-[26px] border border-zinc-800 bg-zinc-950">
            <div className="flex flex-col gap-4 border-b border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="font-bold">
                  #{activeChannelData?.name || "Aucun canal"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {messages.length} message{messages.length !== 1 ? "s" : ""} · mises à jour en direct
                </p>
              </div>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher dans ce canal..."
                disabled={!activeChannel}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm outline-none placeholder:text-zinc-600 focus:border-yellow-400/50 sm:max-w-72"
              />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {loadingMessages && (
                <p className="text-sm text-zinc-500">
                  Chargement des messages...
                </p>
              )}

              {!loadingMessages && filteredMessages.length === 0 && (
                <div className="flex min-h-64 items-center justify-center text-center">
                  <div>
                    <p className="font-semibold text-zinc-300">
                      {search
                        ? "Aucun message ne correspond à la recherche."
                        : "Ce canal est encore vide."}
                    </p>
                    <p className="mt-2 text-sm text-zinc-600">
                      {!search && "Lancez la première discussion avec les personnes concernées."}
                    </p>
                  </div>
                </div>
              )}

              {!loadingMessages &&
                filteredMessages.map((item) => {
                  const isOwnMessage = item.user_id === profile?.id;

                  return (
                    <article
                      key={item.id}
                      className={`group flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl border p-4 sm:max-w-[75%] ${
                          isOwnMessage
                            ? "border-yellow-400/25 bg-yellow-400/10"
                            : "border-zinc-800 bg-black"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="text-sm font-bold">
                            {isOwnMessage
                              ? "Vous"
                              : item.profiles?.nom || "Membre LMG"}
                          </p>
                          <p className="text-xs text-zinc-600">
                            {item.profiles?.role || "membre"} · {formatMessageDate(item.created_at)}
                          </p>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200">
                          {item.message}
                        </p>
                        {isOwnMessage && (
                          <button
                            type="button"
                            onClick={() => void deleteMessage(item.id)}
                            className="mt-2 text-xs font-semibold text-zinc-600 opacity-0 transition hover:text-red-300 group-hover:opacity-100 focus:opacity-100"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={sendMessage}
              className="border-t border-zinc-800 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={
                      activeChannelData
                        ? `Écrire dans #${activeChannelData.name}...`
                        : "Sélectionnez un canal"
                    }
                    disabled={!activeChannelData || sending}
                    maxLength={2000}
                    rows={2}
                    className="w-full resize-none rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400/50 disabled:opacity-50"
                  />
                  <p className="mt-1 text-right text-xs text-zinc-700">
                    {message.length}/2 000
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!message.trim() || !activeChannelData || sending}
                  className="rounded-2xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black p-6 text-white">
          Chargement du chat...
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
