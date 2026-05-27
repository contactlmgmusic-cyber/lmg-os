"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const channel = "general";

  async function fetchMessages() {
    const { data } = await supabaseBrowser
      .from("chat_messages")
      .select(`
        *,
        profiles (
          nom,
          role
        )
      `)
      .eq("channel", channel)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  }

  useEffect(() => {
    fetchMessages();

    const realtimeChannel = supabaseBrowser
      .channel("chat-general")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        async () => {
          await fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(realtimeChannel);
    };
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!message.trim()) return;

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    await supabaseBrowser.from("chat_messages").insert({
      channel,
      user_id: user?.id || null,
      message,
    });

    setMessage("");
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-8">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Chat
        </p>

        <h1 className="text-5xl font-bold">Chat interne</h1>

        <p className="mt-3 text-zinc-400">
          Échanges rapides entre équipe, managers et artistes.
        </p>
      </div>

      <div className="flex h-[70vh] flex-col rounded-3xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-5">
          <p className="font-semibold">#general</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-2xl bg-black p-4">
              <div className="mb-2 flex items-center justify-between gap-4">
                <p className="font-semibold">
                  {msg.profiles?.nom || "Utilisateur"}
                </p>

                <p className="text-xs text-zinc-500">
                  {new Date(msg.created_at).toLocaleString("fr-FR")}
                </p>
              </div>

              <p className="text-zinc-300">{msg.message}</p>
            </div>
          ))}
        </div>

        <form
          onSubmit={sendMessage}
          className="flex gap-3 border-t border-zinc-800 p-5"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white"
          />

          <button className="rounded-2xl bg-white px-6 py-3 font-semibold text-black">
            Envoyer
          </button>
        </form>
      </div>
    </main>
  );
}