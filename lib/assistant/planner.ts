import type { AssistantAction } from "./actions";

export function planAssistantActions(message: string): AssistantAction[] {
  const prompt = message.toLowerCase();
  const actions: AssistantAction[] = [];

  if (prompt.includes("rollout") || prompt.includes("sortie")) {
    actions.push({
      type: "release.createChecklist",
      label: "Créer checklist Release Planner",
    });
  }

  return actions;
}