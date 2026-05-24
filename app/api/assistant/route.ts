import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function fallbackResponse(prompt: string) {
  return {
    strategy: [
      "Créer une identité visuelle forte autour du projet",
      "Construire une campagne TikTok/Reels cohérente",
      "Créer une montée en pression progressive avant la sortie",
      "Activer la communauté avant le jour J",
    ],

    content: [
      "Teaser studio",
      "Behind the scenes",
      "Snippet TikTok",
      "Reveal cover",
      "Stories countdown",
    ],

    rollout: [
      "J-14 : annonce du projet",
      "J-10 : pré-save",
      "J-7 : teaser vidéo",
      "J-3 : extrait TikTok",
      "Jour J : sortie officielle",
      "J+2 : repost fans & influenceurs",
    ],

    tasks: [
      "Créer les visuels promo",
      "Programmer les contenus Instagram",
      "Préparer campagne TikTok Ads",
      "Uploader le morceau sur DSP",
      "Contacter influenceurs et médias",
    ],

    fallback: true,
    prompt,
  };
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(fallbackResponse(prompt));
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: `
Tu es un assistant stratégique pour un label de musique.

Réponds uniquement en JSON valide avec cette structure :

{
  "strategy": [],
  "content": [],
  "rollout": [],
  "tasks": []
}
`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content =
        completion.choices[0].message.content || "{}";

      return Response.json(JSON.parse(content));
    } catch (openAiError: any) {
      console.error("Fallback IA activé :", openAiError?.message);

      return Response.json(fallbackResponse(prompt));
    }
  } catch (error: any) {
    console.error(error);

    return Response.json(
      {
        error: error?.message || "Erreur assistant IA",
      },
      {
        status: 500,
      }
    );
  }
}