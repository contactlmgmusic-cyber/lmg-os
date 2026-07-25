import type { AssistantAction } from "../actions";

export async function executeMarketingAction(action: AssistantAction) {
  if (action.type !== "marketing.createTasks") {
    return null;
  }

  const response = await fetch("/api/assistant/marketing-tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projetId: action.payload?.projetId ?? null,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur création tâches marketing.");
  }

  return data.message || "Tâches marketing créées.";
}