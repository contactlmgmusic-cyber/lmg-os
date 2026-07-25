import type { AssistantAction } from "../actions";

export async function executeReleaseAction(action: AssistantAction) {
  if (action.type !== "release.createChecklist") {
    return null;
  }

  const response = await fetch("/api/assistant/checklist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sortieId: action.payload?.sortieId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur génération checklist.");
  }

  return data.message || "Checklist générée.";
}