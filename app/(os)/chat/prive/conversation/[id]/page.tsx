"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Profile = {
  id: string;
  nom: string | null;
  role: string | null;
};

type Member = {
  user_id: string;
  profiles: Profile | null;
};

type PrivateMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  lu: boolean;
  created_at: string;
  profiles: Profile | null;
};

function formatMessageDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();

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

export default function ChatPriveDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadConversation = useCallback(
    async (currentUserId: string) => {
      const { data: membership, error: membershipError } =
        await supabaseBrowser
          .from("private_conversation_members")
          .select("id")
          .eq("conversation_id", conversationId)
          .eq("user_id", currentUserId)
          .maybeSingle();

      if (membershipError || !membership) {
        window.location.href = "/chat/prive";
        return false;
      }

      const [membersResult, messagesResult] = await Promise.all([
        supabaseBrowser
          .from("private_conversation_members")
          .select(
            `
              user_id,
              profiles (
                id,
                nom,
                role
              )
            `
          )
          .eq("conversation_id", conversationId),
        supabaseBrowser
          .from("private_messages")
          .select(
            `
              id,
              conversation_id,
              sender_id,
              message,
              lu,
              created_at,
              profiles (
                id,
                nom,
                role
              )
            `
          )
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })
          .limit(500),
      ]);

      if (membersResult.error || messagesResult.error) {
        setError("Impossible de charger cette conversation.");
        setLoading(false);
        return false;
      }

      setMembers((membersResult.data || []) as unknown as Member[]);
      setMessages(
        (messagesResult.data || []) as unknown as PrivateMessage[]
      );
      setLoading(false);

      await supabaseBrowser
        .from("private_messages")
        .update({ lu: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUserId)
        .eq("lu", false);

      return true;
    },
    [conversationId]
  );

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let active = true;
    let realtimeChannel: ReturnType<typeof supabaseBrowser.channel> | null =
      null;

    async function initialize() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      if (!active) {
        return;
      }

      setUserId(user.id);
      const authorized = await loadConversation(user.id);

      if (!authorized || !active) {
        return;
      }

      realtimeChannel = supabaseBrowser
        .channel(`private-chat-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "private_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          () => {
            void loadConversation(user.id);
          }
        )
        .subscribe();
    }

    void initialize();

    return () => {
      active = false;

      if (realtimeChannel) {
        void supabaseBrowser.removeChannel(realtimeChannel);
      }
    };
  }, [conversationId, loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || !userId || sending) {
      return;
    }

    if (cleanMessage.length > 2000) {
      setError("Le message ne peut pas dépasser 2 000 caractères.");
      return;
    }

    setSending(true);
    setError("");

    const { error: messageError } = await supabaseBrowser
      .from("private_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        message: cleanMessage,
        lu: false,
      });

    if (messageError) {
      setError("Le message privé n’a pas pu être envoyé.");
      setSending(false);
      return;
    }

    setMessage("");

    const recipients = members.filter(
      (member) => member.user_id !== userId
    );

    if (recipients.length > 0) {
      await supabaseBrowser.from("notifications").insert(
        recipients.map((member) => ({
          user_id: member.user_id,
          type: "Chat",
          titre: "Nouveau message privé",
          description: cleanMessage.slice(0, 100),
          lien: `/chat/prive/conversation/${conversationId}`,
          niveau: "Info",
          lu: false,
          is_read: false,
        }))
      );
    }

    setSending(false);
  }

  async function deleteMessage(messageId: string) {
    if (!window.confirm("Supprimer définitivement ce message privé ?")) {
      return;
    }

    const { error: deleteError } = await supabaseBrowser
      .from("private_messages")
      .delete()
      .eq("id", messageId);

    if (deleteError) {
      setError("Le message n’a pas pu être supprimé.");
    }
  }

  const otherMembers = members.filter(
    (member) => member.user_id !== userId
  );
  const conversationName =
    otherMembers
      .map((member) => member.profiles?.nom || "Membre LMG")
      .join(", ") || "Discussion privée";

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-[1300px] rounded-[26px] border border-zinc-800 bg-zinc-950 p-8 text-zinc-500">
          Chargement de la conversation...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 xl:px-10 xl:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1300px] flex-col">
        <nav className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/chat/prive"
            className="text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            ← Toutes les conversations
          </Link>
          <Link
            href="/chat"
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600"
          >
            Chat d’équipe
          </Link>
        </nav>

        {error && (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
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

        <section className="flex min-h-[650px] flex-1 flex-col overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950">
          <header className="flex items-center gap-4 border-b border-zinc-800 p-4 sm:p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-400/15 text-lg font-bold text-violet-300">
              {conversationName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                Conversation privée
              </p>
              <h1 className="mt-1 truncate text-xl font-bold sm:text-2xl">
                {conversationName}
              </h1>
              <p className="mt-1 text-xs text-zinc-600">
                {messages.length} message{messages.length !== 1 ? "s" : ""} · accès réservé aux membres
              </p>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 && (
              <div className="flex min-h-72 items-center justify-center text-center">
                <div>
                  <p className="font-semibold text-zinc-300">
                    La conversation est vide.
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    Envoyez le premier message à {conversationName}.
                  </p>
                </div>
              </div>
            )}

            {messages.map((item) => {
              const isMine = item.sender_id === userId;

              return (
                <article
                  key={item.id}
                  className={`group flex ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl border p-4 sm:max-w-[72%] ${
                      isMine
                        ? "border-violet-400/25 bg-violet-400/10"
                        : "border-zinc-800 bg-black"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-sm font-bold">
                        {isMine
                          ? "Vous"
                          : item.profiles?.nom || "Membre LMG"}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {formatMessageDate(item.created_at)}
                      </p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200">
                      {item.message}
                    </p>
                    {isMine && (
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-xs text-zinc-600">
                          {item.lu ? "Lu" : "Envoyé"}
                        </span>
                        <button
                          type="button"
                          onClick={() => void deleteMessage(item.id)}
                          className="text-xs font-semibold text-zinc-600 opacity-0 transition hover:text-red-300 group-hover:opacity-100 focus:opacity-100"
                        >
                          Supprimer
                        </button>
                      </div>
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
                  placeholder={`Écrire à ${conversationName}...`}
                  maxLength={2000}
                  rows={2}
                  disabled={sending}
                  className="w-full resize-none rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-400/50 disabled:opacity-50"
                />
                <p className="mt-1 text-right text-xs text-zinc-700">
                  {message.length}/2 000
                </p>
              </div>
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="rounded-2xl bg-violet-300 px-6 py-3 font-bold text-violet-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
