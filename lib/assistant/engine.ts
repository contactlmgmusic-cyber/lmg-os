import { searchLMGContext } from "./knowledge/search";
import { planAssistantActions } from "./planner";

export async function runAssistantEngine(message: string) {
  const context = await searchLMGContext(message);
  const actions = planAssistantActions(message, context);

  const summary =
    context?.sortie?.titre
      ? `J’ai identifié la sortie "${context.sortie.titre}"${context.artiste?.nom ? ` de ${context.artiste.nom}` : ""}.`
      : context?.artiste?.nom
      ? `J’ai identifié l’artiste ${context.artiste.nom}, mais aucune sortie future liée n’a été trouvée.`
      : "Je n’ai pas encore trouvé d’artiste ou de sortie liée dans LMG OS.";

  return {
    summary,
    context,
    actions,
  };
}