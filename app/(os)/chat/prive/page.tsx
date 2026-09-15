"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Profile = {
  id: string;
  nom: string | null;
  role: string | null;
};

type PrivateMessage = {
  id: string;
  message: string;
  sender_id: string;
  lu: boolean;
  created_at: string;
};

type ConversationMember = {
  user_id: string;
  profiles: Profile | null;
};

type ConversationData = {
  id: string;
  created_at: string;
  private_conversation_members: ConversationMember[];
  private_messages: PrivateMessage[];
};

type Conversation = {
  conversation_id: string;
  private_conversations: ConversationData;
  lastMessage: PrivateMessage | null;
  unreadCount: number;
};

function formatDate(value?: string) {
  if (!value) {
    return "Nouvelle conversation";
  }

  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatPrivePage() {
  const [userId, setUserId] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [conversations, setConversations] =
    useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setError("");

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setUserId(user.id);

    const [profilesResult, membershipsResult] = await Promise.all([
      supabaseBrowser
        .from("profiles")
        .select("id, nom, role")
        .neq("id", user.id)
        .order("nom"),
      supabaseBrowser
        .from("private_conversation_members")
        .select(
          `
            conversation_id,
            private_conversations (
              id,
              created_at,
              private_conversation_members (
                user_id,
                profiles (
                  id,
                  nom,
                  role
                )
              ),
              private_messages (
                id,
                message,
                sender_id,
                lu,
                created_at
              )
            )
          `
        )
        .eq("user_id", user.id),
    ]);

    if (profilesResult.error || membershipsResult.error) {
      setError("Impossible de charger vos conversations privées.");
      setLoading(false);
      return;
    }

    setProfiles((profilesResult.data || []) as Profile[]);

    const formatted = (membershipsResult.data || [])
      .flatMap((item): Conversation[] => {
        const conversation = item.private_conversations as unknown as
          | ConversationData
          | null;

        if (!conversation) {
          return [];
        }

        const sortedMessages = [
          ...(conversation.private_messages || []),
        ].sort(
          (first, second) =>
            new Date(second.created_at).getTime() -
            new Date(first.created_at).getTime()
        );

        return [{
          conversation_id: item.conversation_id,
          private_conversations: conversation,
          lastMessage: sortedMessages[0] || null,
          unreadCount: sortedMessages.filter(
            (message) =>
              message.sender_id !== user.id && message.lu === false
          ).length,
        }];
      })
      .sort((first, second) => {
        const firstDate =
          first.lastMessage?.created_at ||
          first.private_conversations.created_at;
        const secondDate =
          second.lastMessage?.created_at ||
          second.private_conversations.created_at;

        return (
          new Date(secondDate).getTime() -
          new Date(firstDate).getTime()
        );
      });

    setConversations(formatted);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const realtimeChannel = supabaseBrowser
      .channel(`private-inbox-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "private_messages",
        },
        () => {
          void loadData();
        }
      )
      .subscribe();

    return () => {
      void supabaseBrowser.removeChannel(realtimeChannel);
    };
  }, [loadData, userId]);

  const availableProfiles = useMemo(
    () =>
      profiles.filter((profile) => {
        const alreadyHasConversation = conversations.some(
          (item) =>
            item.private_conversations.private_conversation_members.some(
              (member) => member.user_id === profile.id
            )
        );

        return !alreadyHasConversation;
      }),
    [conversations, profiles]
  );

  const filteredConversations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return conversations;
    }

    return conversations.filter((item) => {
      const otherMember =
        item.private_conversations.private_conversation_members.find(
          (member) => member.user_id !== userId
        );

      return [
        otherMember?.profiles?.nom,
        otherMember?.profiles?.role,
        item.lastMessage?.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [conversations, search, userId]);

  const unreadTotal = conversations.reduce(
    (total, item) => total + item.unreadCount,
    0
  );

  async function startConversation() {
    if (!selectedUserId || !userId || creating) {
      return;
    }

    setCreating(true);
    setError("");

    const existing = conversations.find((item) =>
      item.private_conversations.private_conversation_members.some(
        (member) => member.user_id === selectedUserId
      )
    );

    if (existing) {
      window.location.href = `/chat/prive/conversation/${existing.conversation_id}`;
      return;
    }

    const { data: conversation, error: conversationError } =
      await supabaseBrowser
        .from("private_conversations")
        .insert({ created_by: userId })
        .select("id")
        .single();

    if (conversationError || !conversation) {
      setError("Impossible de créer cette conversation.");
      setCreating(false);
      return;
    }

    const { error: membersError } = await supabaseBrowser
      .from("private_conversation_members")
      .insert([
        {
          conversation_id: conversation.id,
          user_id: userId,
        },
        {
          conversation_id: conversation.id,
          user_id: selectedUserId,
        },
      ]);

    if (membersError) {
      await supabaseBrowser
        .from("private_conversations")
        .delete()
        .eq("id", conversation.id);
      setError("Impossible d’ajouter les membres à la conversation.");
      setCreating(false);
      return;
    }

    window.location.href = `/chat/prive/conversation/${conversation.id}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-[1500px] rounded-[26px] border border-zinc-800 bg-zinc-950 p-8 text-zinc-500">
          Chargement des messages privés...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 xl:px-10 xl:py-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-300">
              Communication · Direct
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              Messages privés
            </h1>
            <p className="mt-3 text-zinc-400">
              Des échanges confidentiels entre membres LMG, séparés des canaux collectifs.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            <Link
              href="/communication"
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-600"
            >
              Vue globale
            </Link>
            <Link
              href="/chat"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black hover:bg-zinc-200"
            >
              Chat d’équipe
            </Link>
          </nav>
        </header>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <Metric label="Conversations" value={conversations.length} />
          <Metric label="Messages non lus" value={unreadTotal} accent />
          <Metric label="Membres disponibles" value={profiles.length} />
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[370px_1fr]">
          <section className="h-fit rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Nouveau message
            </p>
            <h2 className="mt-3 text-xl font-bold">
              Démarrer une conversation
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Sélectionnez un membre qui n’apparaît pas encore dans votre messagerie.
            </p>

            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              disabled={creating || availableProfiles.length === 0}
              className="mt-6 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none focus:border-violet-400/50 disabled:opacity-50"
            >
              <option value="">
                {availableProfiles.length
                  ? "Choisir un membre"
                  : "Toutes les conversations existent"}
              </option>
              {availableProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.nom || "Utilisateur"} · {profile.role || "membre"}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void startConversation()}
              disabled={!selectedUserId || creating}
              className="mt-3 w-full rounded-xl bg-violet-300 px-5 py-3 font-bold text-violet-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creating ? "Création..." : "Démarrer"}
            </button>
          </section>

          <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Boîte de réception
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  Mes conversations
                </h2>
              </div>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un membre..."
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-400/50 sm:max-w-64"
              />
            </div>

            <div className="mt-5 space-y-3">
              {filteredConversations.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                  <p className="font-semibold text-zinc-300">
                    {search
                      ? "Aucune conversation trouvée."
                      : "Aucune conversation privée."}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    {!search && "Sélectionnez un membre pour commencer."}
                  </p>
                </div>
              )}

              {filteredConversations.map((item) => {
                const otherMember =
                  item.private_conversations.private_conversation_members.find(
                    (member) => member.user_id !== userId
                  );

                return (
                  <Link
                    key={item.conversation_id}
                    href={`/chat/prive/conversation/${item.conversation_id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-violet-400/35 hover:bg-zinc-900"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-400/15 font-bold text-violet-300">
                      {(otherMember?.profiles?.nom || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate font-bold">
                          {otherMember?.profiles?.nom || "Conversation privée"}
                        </span>
                        <span className="shrink-0 text-xs text-zinc-600">
                          {formatDate(item.lastMessage?.created_at)}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-sm text-zinc-500">
                        {item.lastMessage?.message || "Aucun message pour le moment."}
                      </span>
                    </span>
                    {item.unreadCount > 0 ? (
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-violet-300 px-2 text-xs font-bold text-violet-950">
                        {item.unreadCount}
                      </span>
                    ) : (
                      <span className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-violet-300">
                        →
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-violet-400/25 bg-violet-400/10"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? "text-violet-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
