"use client";

import { useState } from "react";

const suggestions = [
  "Crée un rollout complet pour une sortie single",
  "Écris une bio artiste professionnelle",
  "Prépare un pitch booking pour une salle",
  "Fais une stratégie TikTok sur 30 jours",
  "Rédige un communiqué de presse",
  "Crée un plan de sortie complet",
];

export default function AssistantChatClient() {
  type AssistantAction = {
  type: string;
  label: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  actions?: AssistantAction[];
};

const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello, je suis l’assistant AI LMG. Donne-moi un artiste, un projet ou un objectif, et je te prépare un plan clair.",
    },
  ]);

  const [input, setInput] = useState("");


  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!input.trim()) return;

  const userMessage = input.trim();

  setMessages((current) => [
    ...current,
    { role: "user", content: userMessage },
  ]);

  setInput("");

  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
      }),
    });

    const data = await response.json();

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: data.response || "Je n’ai pas réussi à générer de réponse.",
        actions: data.actions || []
      },
    ]);
  } catch (error) {
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: "Erreur de connexion avec l’assistant LMG.",
      },
    ]);
  }
}

function useSuggestion(value: string) {
  setInput(value);
}

  return (
    <main className="flex min-h-screen flex-col bg-black p-10 text-white">
      <div className="mb-8">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG AI
        </p>

        <h1 className="text-5xl font-bold">Assistant IA LMG</h1>

        <p className="mt-3 text-zinc-400">
          Génère des plans, textes, pitchs et stratégies pour les artistes et projets LMG.
        </p>
      </div>

      <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="mb-4 text-sm text-zinc-500">Suggestions rapides</p>

        <div className="flex flex-wrap gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => useSuggestion(suggestion)}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-1 flex-col rounded-3xl border border-zinc-800 bg-zinc-900">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3xl whitespace-pre-wrap rounded-2xl border p-5 ${
                    isUser
                      ? "border-white/20 bg-white text-black"
                      : "border-zinc-800 bg-black text-zinc-200"
                  }`}
                >
                  <p className="mb-2 text-xs opacity-60">
                    {isUser ? "Toi" : "Assistant LMG"}
                  </p>

                  {message.content}

                  {message.role === "assistant" &&
  message.actions &&
  message.actions.length > 0 && (
    <div className="mt-4 flex flex-wrap gap-2">
      {message.actions.map((action) => (
        <button
          key={action.type}
          type="button"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          {action.label}
        </button>
      ))}
    </div>
  )}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 border-t border-zinc-800 p-5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Demande un rollout, une bio, un pitch, une stratégie..."
            className="flex-1 rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <button className="rounded-2xl bg-white px-6 py-4 font-semibold text-black">
            Envoyer
          </button>
        </form>
      </section>
    </main>
  );
}