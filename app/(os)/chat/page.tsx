"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Channel = {
  id: string;
  name: string;
  slug: string;
  type: string | null;
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

function ChatContent() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const searchParams = useSearchParams();

const initialChannel =
  searchParams.get("channel") || "general";

const [activeChannel, setActiveChannel] =
  useState(initialChannel);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  async function fetchChannels() {
  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) {
    window.location.href = "/login";
    return;
  }

  const { data: profile } = await supabaseBrowser
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data } = await supabaseBrowser
    .from("chat_channels")
    .select("*")
    .contains("allowed_roles", [profile?.role])
    .order("created_at", { ascending: true });

  setChannels(data || []);

  if (data && data.length > 0 && !data.some((c) => c.slug === activeChannel)) {
    setActiveChannel(data[0].slug);
    await fetchMessages(data[0].slug);
  }
}

  async function fetchMessages(channelSlug = activeChannel) {
    const { data } = await supabaseBrowser
      .from("chat_messages")
      .select(`
        *,
        profiles (
          nom,
          role
        )
      `)
      .eq("channel", channelSlug)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  }

  useEffect(() => {
    fetchChannels();
    fetchMessages("general");

    const realtimeChannel = supabaseBrowser
      .channel("chat-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          if (newMessage.channel === activeChannel) {
            await fetchMessages(activeChannel);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(realtimeChannel);
    };
  }, [activeChannel]);

  async function changeChannel(slug: string) {
    setActiveChannel(slug);
    await fetchMessages(slug);
  }

  async function sendMessage(e: React.FormEvent) {
  e.preventDefault();

  if (!message.trim()) return;

  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) {
    window.location.href = "/login";
    return;
  }

  const { data: profile } = await supabaseBrowser
    .from("profiles")
    .select("id, nom, role")
    .eq("id", user.id)
    .single();

  await supabaseBrowser.from("chat_messages").insert({
    channel: activeChannel,
    user_id: user.id,
    message,
  });

  const { data: channelMembers } = await supabaseBrowser
    .from("profiles")
    .select("id, role")
    .neq("id", user.id);

  const { data: currentChannel } = await supabaseBrowser
    .from("chat_channels")
    .select("name, slug, allowed_roles")
    .eq("slug", activeChannel)
    .single();

  const allowedRoles = currentChannel?.allowed_roles || [];

  const recipients =
    channelMembers?.filter((member: any) =>
      allowedRoles.includes(member.role)
    ) || [];

  if (recipients.length > 0) {
    await supabaseBrowser.from("notifications").insert(
      recipients.map((member: any) => ({
        user_id: member.id,
        type: "Chat",
        titre: `Nouveau message dans #${currentChannel?.name || activeChannel}`,
        description: `${profile?.nom || "Un membre"} : ${message.slice(0, 80)}`,
        lien: `/chat?channel=${activeChannel}`,
        niveau: "Info",
        lu: false,
        is_read: false,
      }))
    );
  }

  setMessage("");
}

  const activeChannelData = channels.find(
    (channel) => channel.slug === activeChannel
  );

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-8">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Chat
        </p>

        <h1 className="text-5xl font-bold">Chat interne</h1>

        <p className="mt-3 text-zinc-400">
          Channels équipe, rollout, artistes et projets.
        </p>
      </div>

      <div className="grid h-[72vh] grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-xl font-bold">Channels</h2>

          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => changeChannel(channel.slug)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                  activeChannel === channel.slug
                    ? "bg-white font-semibold text-black"
                    : "bg-black text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                #{channel.name}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-5">
            <p className="font-semibold">
              #{activeChannelData?.name || activeChannel}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Channel {activeChannelData?.type || "general"}
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <p className="text-zinc-500">
                Aucun message pour le moment.
              </p>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="rounded-2xl bg-black p-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {msg.profiles?.nom || "Utilisateur"}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {msg.profiles?.role || "member"}
                    </p>
                  </div>

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
              placeholder={`Écrire dans #${activeChannelData?.name || activeChannel}...`}
              className="flex-1 rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white"
            />

            <button className="rounded-2xl bg-white px-6 py-3 font-semibold text-black">
              Envoyer
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
export default function ChatPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black p-10 text-white">Chargement du chat...</main>}>
      <ChatContent />
    </Suspense>
  );
}