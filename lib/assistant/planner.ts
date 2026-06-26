import type { AssistantAction } from "./actions";

export function planAssistantActions(
  message: string,
  context: any
): AssistantAction[] {
  const prompt = message.toLowerCase();

  const actions: AssistantAction[] = [];

  if (
    prompt.includes("rollout") ||
    prompt.includes("sortie")
  ) {
    actions.push({
      type: "release.createChecklist",
      label: "Créer checklist Release Planner",
     payload: {
  artisteId: context?.artiste?.id,
  artiste: context?.artiste?.nom,
  sortieId: context?.sortie?.id,
  projetId: context?.sortie?.projet_id,
  },
 });

 actions.push({
  type: "marketing.createTasks",
  label: "Créer tâches marketing",
  payload: {
    artisteId: context?.artiste?.id,
    artiste: context?.artiste?.nom,
    sortieId: context?.sortie?.id,
    projetId: context?.sortie?.projet_id,
  },
});
  }

  return actions;
}