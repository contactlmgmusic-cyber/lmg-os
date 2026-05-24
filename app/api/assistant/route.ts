import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY manquante" },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
Tu es un assistant stratégique pour un label de musique.
Réponds uniquement en JSON valide avec cette structure :
{
  "strategy": ["..."],
  "content": ["..."],
  "rollout": ["..."],
  "tasks": ["..."]
}
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0].message.content || "{}";

    return Response.json(JSON.parse(content));
  } catch (error: any) {
    console.error("Erreur OpenAI:", error);

    return Response.json(
      {
        error: error?.message || "Erreur génération IA",
      },
      { status: 500 }
    );
  }
}