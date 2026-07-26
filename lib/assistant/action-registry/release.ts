import type { AssistantAction } from "../actions";

export async function executeReleaseAction(action: AssistantAction) {
  if (action.type !== "release.createChecklist") {
    return null;
  }

  const sortieId = action.payload?.sortieId;

  if (!sortieId || typeof sortieId !== "string") {
    throw new Error("Sortie invalide ou manquante.");
  }

  const response = await fetch("/api/assistant/checklist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sortieId,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || "Erreur lors de la génération de la checklist."
    );
  }

  return data?.message || "Checklist générée.";
}