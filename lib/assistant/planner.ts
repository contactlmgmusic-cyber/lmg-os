import type { AssistantAction } from "./actions";

import type { AssistantIntent } from "./intents/types";

export function planAssistantActions(

  intent: AssistantIntent,

  message: string,

  context: any

): AssistantAction[] {

  const actions: AssistantAction[] = [];

  if (intent === "release") {
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