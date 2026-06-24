import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const templates: Record<string, any[]> = {
  Single: [
    { titre: "Finaliser le mix", jours_avant: 60, categorie: "Production" },
    { titre: "Valider le master", jours_avant: 55, categorie: "Production" },
    { titre: "Finaliser la cover", jours_avant: 50, categorie: "Créatif" },
    { titre: "Valider les métadonnées", jours_avant: 45, categorie: "Distribution" },
    { titre: "Envoyer en distribution", jours_avant: 40, categorie: "Distribution" },
    { titre: "Préparer le press kit", jours_avant: 30, categorie: "Médias" },
    { titre: "Préparer 10 contenus courts", jours_avant: 25, categorie: "Marketing" },
    { titre: "Planifier les teasers", jours_avant: 21, categorie: "Marketing" },
    { titre: "Créer le pré-save", jours_avant: 18, categorie: "Distribution" },
    { titre: "Activer influenceurs", jours_avant: 14, categorie: "Marketing" },
    { titre: "Pitch playlists / médias", jours_avant: 10, categorie: "Médias" },
    { titre: "Préparer posts Jour J", jours_avant: 3, categorie: "Release Day" },
    { titre: "Publier le contenu officiel", jours_avant: 0, categorie: "Release Day" },
    { titre: "Analyser les performances", jours_avant: -7, categorie: "Analyse" },
  ],
  EP: [
    { titre: "Valider tracklist EP", jours_avant: 90, categorie: "Production" },
    { titre: "Finaliser tous les masters", jours_avant: 75, categorie: "Production" },
    { titre: "Valider cover EP", jours_avant: 65, categorie: "Créatif" },
    { titre: "Créer les visuels par titre", jours_avant: 60, categorie: "Créatif" },
    { titre: "Envoyer EP en distribution", jours_avant: 50, categorie: "Distribution" },
    { titre: "Créer le pré-save EP", jours_avant: 40, categorie: "Distribution" },
    { titre: "Préparer press kit EP", jours_avant: 35, categorie: "Médias" },
    { titre: "Planifier contenus TikTok/Reels", jours_avant: 30, categorie: "Marketing" },
    { titre: "Pitch médias / playlists", jours_avant: 14, categorie: "Médias" },
    { titre: "Préparer posts Jour J", jours_avant: 3, categorie: "Release Day" },
    { titre: "Sortie officielle EP", jours_avant: 0, categorie: "Release Day" },
    { titre: "Analyser titres les plus performants", jours_avant: -7, categorie: "Analyse" },
  ],
  Album: [
    { titre: "Valider direction artistique album", jours_avant: 120, categorie: "Stratégie" },
    { titre: "Valider tracklist album", jours_avant: 100, categorie: "Production" },
    { titre: "Finaliser masters album", jours_avant: 85, categorie: "Production" },
    { titre: "Valider cover album", jours_avant: 75, categorie: "Créatif" },
    { titre: "Créer press kit album", jours_avant: 60, categorie: "Médias" },
    { titre: "Envoyer album en distribution", jours_avant: 55, categorie: "Distribution" },
    { titre: "Préparer campagne contenu", jours_avant: 45, categorie: "Marketing" },
    { titre: "Préparer campagne médias", jours_avant: 35, categorie: "Médias" },
    { titre: "Préparer activation release party", jours_avant: 25, categorie: "Événement" },
    { titre: "Pitch playlists / médias", jours_avant: 20, categorie: "Médias" },
    { titre: "Préparer posts Jour J", jours_avant: 5, categorie: "Release Day" },
    { titre: "Sortie officielle album", jours_avant: 0, categorie: "Release Day" },
    { titre: "Analyser performances globales", jours_avant: -10, categorie: "Analyse" },
  ],
  Clip: [
    { titre: "Valider scénario / concept clip", jours_avant: 45, categorie: "Créatif" },
    { titre: "Valider date de tournage", jours_avant: 40, categorie: "Production" },
    { titre: "Valider lieux / équipe", jours_avant: 35, categorie: "Production" },
    { titre: "Tourner le clip", jours_avant: 25, categorie: "Production" },
    { titre: "Valider montage final", jours_avant: 12, categorie: "Post-production" },
    { titre: "Préparer teaser clip", jours_avant: 7, categorie: "Marketing" },
    { titre: "Programmer première YouTube", jours_avant: 5, categorie: "Distribution" },
    { titre: "Publier le clip", jours_avant: 0, categorie: "Release Day" },
    { titre: "Analyser vues et rétention", jours_avant: -7, categorie: "Analyse" },
  ],
};

function getTemplate(type?: string) {
  const value = (type || "").toLowerCase();

  if (value.includes("ep")) return templates.EP;
  if (value.includes("album")) return templates.Album;
  if (value.includes("clip")) return templates.Clip;

  return templates.Single;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sortieId = body.sortieId;

    if (!sortieId) {
      return NextResponse.json(
        { error: "sortieId manquant." },
        { status: 400 }
      );
    }

    const { data: sortie, error: sortieError } = await supabase
      .from("sorties")
      .select("id, titre, type, date_sortie, projet_id")
      .eq("id", sortieId)
      .single();

    if (sortieError || !sortie) {
      return NextResponse.json(
        { error: "Sortie introuvable." },
        { status: 404 }
      );
    }

    if (!sortie.date_sortie) {
      return NextResponse.json(
        { error: "Date de sortie manquante." },
        { status: 400 }
      );
    }

    const selectedTemplate = getTemplate(sortie.type);
    const releaseDate = new Date(sortie.date_sortie);

    const rows = selectedTemplate.map((task) => {
      const datePrevue = new Date(releaseDate);
      datePrevue.setDate(releaseDate.getDate() - task.jours_avant);

      return {
        sortie_id: sortie.id,
        projet_id: sortie.projet_id || null,
        titre: task.titre,
        categorie: task.categorie,
        jours_avant: task.jours_avant,
        statut: "À faire",
        date_prevue: datePrevue.toISOString().split("T")[0],
      };
    });

    await supabase
  .from("release_tasks")
  .delete()
  .eq("sortie_id", sortie.id);

    const { error: insertError } = await supabase
      .from("release_tasks")
      .insert(rows);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Checklist générée pour ${sortie.titre}.`,
      count: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur génération checklist." },
      { status: 500 }
    );
  }
}