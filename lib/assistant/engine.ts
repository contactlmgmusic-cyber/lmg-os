import type { AssistantPlan } from "./types";
import { searchLMGContext } from "./knowledge/search";
import { planAssistantActions } from "./planner";
import { detectIntent } from "./intents/detectIntent";

export async function runAssistantEngine(
  message: string
): Promise<AssistantPlan> {
  const context = await searchLMGContext(message);

  const intent = detectIntent(message);

const actions = planAssistantActions(
  intent,
  message,
  context
);

  const recommendations: string[] = [];

  if (actions.some((a) => a.type === "release.createChecklist")) {
    recommendations.push("Créer la checklist Release Planner");
    recommendations.push("Créer les événements calendrier");
    recommendations.push("Préparer les tâches marketing");
    recommendations.push("Préparer les relances médias");
  }

  const summary =
    context?.sortie?.titre
      ? `J'ai identifié la sortie "${context.sortie.titre}" de ${context.artiste?.nom}.`
      : context?.artiste?.nom
      ? `J'ai identifié l'artiste ${context.artiste.nom}.`
      : "Je n'ai trouvé aucun artiste ou projet correspondant dans LMG OS.";

  return {
    summary,
    recommendations,
    estimatedTime: "≈ 2 minutes",
    actions,
  };
}