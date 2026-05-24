import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = body.prompt;

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `
Tu es un assistant stratégique pour un label de musique.

Tu aides à :
- créer des stratégies de sortie
- générer des idées TikTok
- préparer des rollout musicaux
- proposer des tâches équipe
- créer des campagnes virales

Réponds toujours en JSON valide avec cette structure :

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
      temperature: 0.9,
    });

    const text =
      completion.choices[0].message.content || "{}";

    return Response.json(JSON.parse(text));
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Erreur génération IA",
      },
      {
        status: 500,
      }
    );
  }
}