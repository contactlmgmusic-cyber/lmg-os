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
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Hello, je suis l’assistant LMG. Donne-moi un artiste, un projet ou un objectif, et je te prépare un plan clair.",
    },
  ]);

  const [input, setInput] = useState("");

  function generateLocalResponse(prompt: string) {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("rollout")) {
      return `Voici une structure de rollout LMG :

1. Positionnement
- Définir le message principal de la sortie
- Identifier l’audience cible
- Valider l’univers visuel

2. Pré-lancement J-30 à J-15
- Teasers vidéo
- Annonce cover
- Création contenus TikTok/Reels
- Préparation pitch médias/playlists

3. Activation J-14 à J-3
- Extraits audio
- Storytelling artiste
- Behind the scenes
- Relances médias/influenceurs

4. Release Day
- Post officiel
- Stories lien streaming
- Push équipe/proches
- Activation médias et playlists

5. Post-sortie J+1 à J+30
- Analyse stats
- Relance contenu performant
- Version live/acoustique/remix
- Campagne UGC/TikTok`;
    }

    if (lowerPrompt.includes("bio")) {
      return `Voici une base de bio artiste :

[Nom de l’artiste] est un artiste émergent qui développe un univers entre authenticité, ambition et identité forte. À travers sa musique, il construit un lien direct avec son public, porté par une direction artistique cohérente et une vision claire.

Accompagné par Legacy Music Group, [Nom] travaille sur son développement artistique, son image, sa stratégie de sortie et son positionnement professionnel. Son objectif : construire une carrière durable, crédible et impactante.`;
    }

    if (lowerPrompt.includes("booking") || lowerPrompt.includes("pitch")) {
      return `Objet : Proposition booking artiste LMG

Bonjour,

Je me permets de vous contacter au nom de Legacy Music Group afin de vous présenter [Nom de l’artiste], artiste que nous accompagnons dans son développement.

Son univers musical, son énergie scénique et son potentiel de progression pourraient parfaitement correspondre à votre programmation.

Nous serions ravis d’échanger avec vous au sujet d’une éventuelle date, première partie, showcase ou programmation à venir.

Je peux vous transmettre son press kit, ses liens d’écoute et ses éléments visuels.

Bien cordialement,`;
    }

    if (lowerPrompt.includes("tiktok")) {
      return `Stratégie TikTok 30 jours :

Semaine 1 — Installer l’univers
- 3 vidéos storytelling artiste
- 2 extraits studio
- 2 vidéos lifestyle

Semaine 2 — Tester les angles
- Hook émotionnel
- Hook performance
- Hook tendance
- Hook coulisses

Semaine 3 — Amplifier
- Reposter le meilleur format
- Créer une série récurrente
- Encourager les commentaires
- Répondre en vidéo

Semaine 4 — Convertir
- Push vers streaming
- Teaser release
- Vidéo face cam
- Contenu fan/community`;
    }

    if (lowerPrompt.includes("communiqué")) {
      return `COMMUNIQUÉ DE PRESSE

Legacy Music Group présente [Nom de l’artiste] avec son nouveau projet [Titre].

Avec cette sortie, l’artiste affirme un univers musical fort, porté par une direction artistique soignée et une identité authentique. Le projet s’inscrit dans une dynamique de développement ambitieuse, mêlant stratégie musicale, image et storytelling.

Disponible prochainement sur les plateformes, [Titre] marque une nouvelle étape dans le parcours de [Nom de l’artiste].

Contact presse :
Legacy Music Group`;
    }

    return `Voici une première réponse structurée :

1. Objectif
Clarifier ce que tu veux obtenir : visibilité, streams, booking, image, communauté ou revenus.

2. Situation actuelle
Identifier l’artiste, le projet, la date, les forces, les faiblesses et les ressources disponibles.

3. Plan d’action
Construire une stratégie en 3 temps :
- préparation
- activation
- suivi

4. Prochaines actions
- définir le message
- créer les contenus
- planifier les dates
- assigner les tâches
- mesurer les résultats

Donne-moi plus de détails sur l’artiste ou le projet et je te fais une version beaucoup plus précise.`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = input.trim();
    const assistantResponse = generateLocalResponse(userMessage);

    setMessages((current) => [
      ...current,
      { role: "user", content: userMessage },
      { role: "assistant", content: assistantResponse },
    ]);

    setInput("");
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