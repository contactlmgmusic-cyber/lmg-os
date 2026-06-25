import { NextResponse } from "next/server";
import { runAssistantEngine } from "@/lib/assistant/engine";

function cleanMessage(message: string) {
  return message.trim().toLowerCase();
}

function buildRollout(message: string) {
  return `🎯 ROLLOUT LMG — PLAN DE SORTIE

Objectif :
Construire une sortie propre, progressive et exploitable sur 30 jours.

1. Positionnement
- Définir le message principal du titre.
- Identifier l’audience cible.
- Clarifier l’univers visuel.
- Choisir 3 angles de communication : émotion, performance, lifestyle.

2. Préparation J-30 à J-21
- Valider cover, date, plateformes et assets.
- Préparer 10 contenus courts.
- Préparer bio courte, pitch média et texte de post.
- Créer la checklist release planner.

3. Teasing J-20 à J-10
- Teaser audio.
- Storytelling artiste.
- Behind the scenes studio.
- Extrait lyrics / punchline.
- Annonce progressive de la date.

4. Activation J-9 à J-1
- Push TikTok/Reels quotidien.
- Relance médias, influenceurs et playlists.
- Préparer stories, lien de pré-save, visuels.
- Mobiliser proches, équipe et premiers fans.

5. Release Day
- Post officiel.
- Stories avec lien streaming.
- Envoi presse/bookers/partenaires.
- Push communauté.
- Suivi stats premières 24h.

6. Post-sortie J+1 à J+30
- Recycler les contenus qui performent.
- Publier version live/acoustique/freestyle si possible.
- Relancer médias.
- Analyser streams, vues, saves, partages.
- Décider si on amplifie avec budget ou contenu additionnel.

Prochaines actions LMG :
- Créer les tâches dans le release planner.
- Ajouter la date au calendrier.
- Préparer le pitch médias.
- Préparer 15 idées TikTok/Reels.`;
}

function buildTikTok(message: string) {
  return `📱 STRATÉGIE TIKTOK / REELS — 30 JOURS

Objectif :
Créer une répétition autour du titre sans donner l’impression de spammer.

Semaine 1 — Installer l’univers
- 2 vidéos face cam de l’artiste.
- 2 vidéos lifestyle.
- 2 extraits studio.
- 1 vidéo “pourquoi ce son existe”.

Semaine 2 — Tester les hooks
- Hook émotionnel.
- Hook drôle ou relatable.
- Hook performance.
- Hook storytime.
- Hook phrase forte du morceau.

Semaine 3 — Amplifier
- Reprendre les 2 meilleurs formats.
- Répondre aux commentaires en vidéo.
- Créer une mini-série.
- Poster un contenu brut / moins produit.

Semaine 4 — Convertir
- Pousser vers le streaming.
- Poster le meilleur extrait.
- Créer un challenge simple.
- Demander l’avis du public.
- Mettre le lien en bio.

Formats à produire :
- POV
- Lyrics screen
- Studio session
- Avant/après mix
- Réaction artiste
- Storytime
- Freestyle court
- Trend adaptée au son

KPI à suivre :
- taux de rétention
- partages
- commentaires
- clics lien bio
- créations UGC`;
}

function buildBooking(message: string) {
  return `🎤 PITCH BOOKING — VERSION PRO

Objet : Proposition booking — Artiste LMG

Bonjour,

Je me permets de vous contacter au nom de Legacy Music Group afin de vous présenter un artiste que nous accompagnons actuellement dans son développement.

Son univers musical, son identité visuelle et son potentiel scénique peuvent parfaitement s’inscrire dans une programmation live, showcase, première partie ou événement culturel.

Nous serions ravis d’échanger avec vous afin d’étudier une opportunité de collaboration sur une date à venir.

Nous pouvons vous transmettre :
- press kit
- liens d’écoute
- photos presse
- vidéos live / extraits
- fiche technique si nécessaire

L’objectif est de construire une proposition cohérente avec votre programmation et le public attendu.

Bien cordialement,

Legacy Music Group

À personnaliser :
- Nom de l’artiste
- Style musical
- Ville cible
- Type d’événement
- Lien press kit
- Références live`;
}

function buildBio(message: string) {
  return `📝 BIO ARTISTE — BASE PROFESSIONNELLE

[Nom de l’artiste] est un artiste en développement accompagné par Legacy Music Group.

À travers un univers musical marqué par [style / influences], il construit une identité forte, sincère et identifiable. Sa musique met en avant [thèmes principaux : ambition, vécu, émotions, énergie, quartier, amour, dépassement, etc.], avec une direction artistique pensée pour créer un vrai lien avec son public.

Son projet artistique repose sur trois piliers :
- une identité musicale claire
- une image cohérente
- une stratégie de développement durable

Accompagné par LMG, [Nom] travaille sur ses sorties, son positionnement, sa présence digitale, son image et ses opportunités live.

Version courte :
[Nom de l’artiste] développe un univers entre [style] et [influence], porté par une identité forte et une vision artistique ambitieuse. Accompagné par Legacy Music Group, il construit progressivement une trajectoire professionnelle autour de sa musique, son image et sa communauté.`;
}

function buildPressRelease(message: string) {
  return `📰 COMMUNIQUÉ DE PRESSE — STRUCTURE LMG

COMMUNIQUÉ DE PRESSE

Legacy Music Group présente [Nom de l’artiste] avec son nouveau projet [Titre].

Avec cette sortie, [Nom de l’artiste] affirme une direction artistique claire et une identité musicale en pleine évolution. Le projet s’inscrit dans une volonté de construire une carrière durable, cohérente et connectée à son public.

[Titre] met en avant [thème du morceau] à travers une production [ambiance : sombre, solaire, club, mélodique, introspective, etc.] et une interprétation portée par [force principale de l’artiste].

Cette sortie marque une nouvelle étape dans le développement de l’artiste, accompagné par Legacy Music Group sur sa stratégie, son image et son déploiement.

Informations :
- Artiste : [Nom]
- Titre : [Titre]
- Date de sortie : [Date]
- Label / accompagnement : Legacy Music Group
- Liens : [Streaming / press kit]

Contact :
Legacy Music Group`;
}

function buildEPK(message: string) {
  return `📂 EPK — ELECTRONIC PRESS KIT

Structure recommandée :

1. Présentation artiste
- Nom
- Ville
- Style musical
- Positionnement
- Bio courte
- Bio longue

2. Identité artistique
- Univers musical
- Influences
- Thèmes abordés
- Direction visuelle

3. Musique
- Dernières sorties
- Liens streaming
- Clips
- Performances live

4. Chiffres clés
- Streams
- Followers
- Vues
- Audience principale
- Pays / villes fortes

5. Presse & médias
- Articles
- Interviews
- Passages radio
- Playlists

6. Booking
- Type de show
- Durée set
- Besoins techniques
- Contact booking

7. Assets
- Photos presse
- Logo
- Covers
- Liens téléchargement

Objectif :
Donner à un média, booker ou partenaire tout ce dont il a besoin pour comprendre et programmer l’artiste rapidement.`;
}

function buildRelance(message: string) {
  return `📩 RELANCE PROFESSIONNELLE

Objet : Relance — Proposition Legacy Music Group

Bonjour,

Je me permets de revenir vers vous concernant mon précédent message au sujet de [artiste / projet / collaboration].

Nous pensons qu’il pourrait y avoir une vraie cohérence entre votre structure et l’univers que nous développons avec Legacy Music Group.

Je serais ravie d’échanger avec vous rapidement afin de vous présenter le projet plus en détail et voir si une collaboration peut être envisagée.

Je reste disponible pour vous transmettre les éléments nécessaires :
- press kit
- liens d’écoute
- visuels
- informations booking
- proposition de partenariat

Bien cordialement,

Legacy Music Group`;
}

function buildDefault(message: string) {
  return `🤖 ASSISTANT LMG — RÉPONSE STRUCTURÉE

J’ai bien compris ta demande :

"${message}"

Voici comment je te conseille de l’aborder :

1. Clarifier l’objectif
- Visibilité ?
- Streams ?
- Booking ?
- Image ?
- Revenus ?
- Communauté ?

2. Identifier le contexte
- Artiste concerné
- Projet concerné
- Date importante
- Ressources disponibles
- Urgence

3. Construire un plan en 3 temps
- Préparation
- Activation
- Suivi

4. Transformer en actions LMG OS
- Créer les tâches
- Ajouter les dates au calendrier
- Préparer les documents
- Notifier les personnes concernées
- Suivre les résultats

Tu peux me demander par exemple :
- "Fais un rollout pour un single afro"
- "Écris une bio pour LAAM"
- "Prépare un pitch booking"
- "Fais une stratégie TikTok"
- "Rédige une relance média"
- "Structure un EPK"`;
}

function generateLocalAssistantResponse(message: string) {
  const prompt = cleanMessage(message);

  if (prompt.includes("rollout") || prompt.includes("plan de sortie")) {
    return buildRollout(message);
  }

  if (prompt.includes("tiktok") || prompt.includes("reels")) {
    return buildTikTok(message);
  }

  if (
    prompt.includes("booking") ||
    prompt.includes("booker") ||
    prompt.includes("festival") ||
    prompt.includes("salle")
  ) {
    return buildBooking(message);
  }

  if (prompt.includes("bio") || prompt.includes("biographie")) {
    return buildBio(message);
  }

  if (
    prompt.includes("communiqué") ||
    prompt.includes("presse") ||
    prompt.includes("media") ||
    prompt.includes("média")
  ) {
    return buildPressRelease(message);
  }

  if (prompt.includes("epk") || prompt.includes("press kit")) {
    return buildEPK(message);
  }

  if (
    prompt.includes("relance") ||
    prompt.includes("mail") ||
    prompt.includes("email")
  ) {
    return buildRelance(message);
  }

  return buildDefault(message);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message manquant." },
        { status: 400 }
      );
    }

    const response = generateLocalAssistantResponse(message);
const engine = await runAssistantEngine(message);


const plan = await runAssistantEngine(message);

return NextResponse.json({
  response,
  plan,
});
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur assistant." },
      { status: 500 }
    );
  }
}
