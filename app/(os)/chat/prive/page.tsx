"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ChatPrivePage() {
  const [userId, setUserId] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
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

    const { data: usersData } = await supabaseBrowser
      .from("profiles")
      .select("id, nom, role")
      .neq("id", user.id)
      .order("nom");

    setProfiles(usersData || []);

    const { data: memberships } = await supabaseBrowser
      .from("private_conversation_members")
      .select(`
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
          )
        )
      `)
      .eq("user_id", user.id);

    setConversations(memberships || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function startConversation() {
    if (!selectedUserId || !userId) return;

    const existing = conversations.find((item: any) => {
      const members =
        item.private_conversations?.private_conversation_members || [];

      const memberIds = members.map((member: any) => member.user_id);

      return memberIds.includes(userId) && memberIds.includes(selectedUserId);
    });

    if (existing?.conversation_id) {
      window.location.href = `/chat/prive/conversation/${existing.conversation_id}`;
      return;
    }

    const { data: conversation, error } = await supabaseBrowser
      .from("private_conversations")
      .insert({})
      .select("id")
      .single();

    if (error || !conversation) {
      alert(error?.message || "Impossible de créer la conversation.");
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
      alert(membersError.message);
      return;
    }

    window.location.href = `/chat/prive/conversation/${conversation.id}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Private Chat
        </p>

        <h1 className="text-5xl font-bold">Messages privés</h1>

        <p className="mt-3 text-zinc-400">
          Crée ou retrouve une conversation privée avec un membre LMG.
        </p>
      </div>

      <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="mb-5 text-2xl font-bold">Nouvelle conversation</h2>

        <div className="flex flex-col gap-4 md:flex-row">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-800 bg-black px-4 py-4"
          >
            <option value="">Choisir un membre</option>

            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.nom || "Utilisateur"} • {profile.role || "membre"}
              </option>
            ))}
          </select>

          <button
            onClick={startConversation}
            className="rounded-xl bg-white px-6 py-4 font-semibold text-black hover:bg-zinc-200"
          >
            Démarrer
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="mb-5 text-2xl font-bold">Mes conversations</h2>

        {conversations.length === 0 && (
          <p className="text-zinc-500">Aucune conversation privée.</p>
        )}

        <div className="space-y-4">
          {conversations.map((item: any) => {
            const members =
              item.private_conversations?.private_conversation_members || [];

            const otherMember = members.find(
              (member: any) => member.user_id !== userId
            );

            return (
              <Link
                key={item.conversation_id}
                href={`/chat/prive/conversation/${item.conversation_id}`}
                className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
              >
                <h3 className="text-xl font-bold">
                  {otherMember?.profiles?.nom || "Conversation privée"}
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  {otherMember?.profiles?.role || "membre"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}