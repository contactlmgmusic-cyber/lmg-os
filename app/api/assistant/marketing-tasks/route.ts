import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const marketingTasks = [
  { titre: "Préparer 10 idées TikTok/Reels", priorite: "Haute" },
  { titre: "Créer le calendrier de contenu", priorite: "Haute" },
  { titre: "Préparer les teasers vidéo", priorite: "Moyenne" },
  { titre: "Préparer les captions Instagram", priorite: "Moyenne" },
  { titre: "Préparer les stories Jour J", priorite: "Moyenne" },
  { titre: "Identifier 10 influenceurs à contacter", priorite: "Haute" },
  { titre: "Préparer le message de relance médias", priorite: "Moyenne" },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projetId = body.projetId || null;

    const rows = marketingTasks.map((task) => ({
      titre: task.titre,
      priorite: task.priorite,
      statut: "À faire",
      projet_id: projetId,
    }));

    const { error } = await supabase.from("taches").insert(rows);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `${rows.length} tâches marketing créées.`,
      count: rows.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur création tâches marketing." },
      { status: 500 }
    );
  }
}