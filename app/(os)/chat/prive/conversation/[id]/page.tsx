"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ChatPriveDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const [userId, setUserId] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setUserId(user.id);

    const { data: membership } = await supabaseBrowser
      .from("private_conversation_members")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      window.location.href = "/chat/prive";
      return;
    }

    const { data: membersData } = await supabaseBrowser
      .from("private_conversation_members")
      .select(`
        user_id,
        profiles (
          id,
          nom,
          role
        )
      `)
      .eq("conversation_id", conversationId);

    const { data: messagesData } = await supabaseBrowser
      .from("private_messages")
      .select(`
        *,
        profiles (
          id,
          nom,
          role
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMembers(membersData || []);
    setMessages(messagesData || []);
    setLoading(false);

    await supabaseBrowser
  .from("private_messages")
  .update({ lu: true })
  .eq("conversation_id", conversationId)
  .neq("sender_id", user.id);
  }

  useEffect(() => {
    if (!conversationId) return;

    loadData();

    const realtimeChannel = supabaseBrowser
      .channel(`private-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "private_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          await loadData();
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(realtimeChannel);
    };
  }, [conversationId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!message.trim() || !userId) return;

    const { error } = await supabaseBrowser.from("private_messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      message,
      lu: false,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const recipients = members.filter((member) => member.user_id !== userId);

    if (recipients.length > 0) {
      await supabaseBrowser.from("notifications").insert(
        recipients.map((member) => ({
          user_id: member.user_id,
          type: "Chat",
          titre: "Nouveau message privé",
          description: message.slice(0, 100),
          lien: `/chat/prive/${conversationId}`,
          niveau: "Info",
          lu: false,
          is_read: false,
        }))
      );
    }

    setMessage("");
    await loadData();
  }

  const otherMembers = members.filter((member) => member.user_id !== userId);

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-black p-10 text-white">
      <Link href="/chat/prive" className="mb-6 text-sm text-zinc-400 hover:text-white">
        ← Retour aux messages privés
      </Link>

      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Conversation privée
        </p>

        <h1 className="text-4xl font-bold">
          {otherMembers.map((member) => member.profiles?.nom || "Utilisateur").join(", ") ||
            "Discussion privée"}
        </h1>

        <p className="mt-3 text-zinc-400">
          Messages privés sécurisés entre membres LMG.
        </p>
      </div>

      <section className="flex flex-1 flex-col rounded-3xl border border-zinc-800 bg-zinc-900">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && (
            <p className="text-zinc-500">Aucun message pour le moment.</p>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === userId;

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl border p-4 ${
                    isMine
                      ? "border-white/20 bg-white text-black"
                      : "border-zinc-800 bg-black text-white"
                  }`}
                >
                  <p className={`text-xs ${isMine ? "text-zinc-600" : "text-zinc-500"}`}>
                    {msg.profiles?.nom || "Utilisateur"} •{" "}
                    {new Date(msg.created_at).toLocaleString("fr-FR")}
                  </p>

                  <p className="mt-2 whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={sendMessage}
          className="flex gap-3 border-t border-zinc-800 p-5"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrire un message privé..."
            className="flex-1 rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white"
          />

          <button className="rounded-2xl bg-white px-6 py-3 font-semibold text-black">
            Envoyer
          </button>
        </form>
      </section>
    </main>
  );
}