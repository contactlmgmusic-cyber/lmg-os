import type { AssistantAction } from "../actions";
import { executeReleaseAction } from "./release";
import { executeMarketingAction } from "./marketing";

export async function executeAssistantAction(action: AssistantAction) {
  if (!action || typeof action.type !== "string") {
    throw new Error("Action invalide.");
  }

  if (!action.label || typeof action.label !== "string") {
    throw new Error("Action invalide.");
  }
  const handlers = [
  executeReleaseAction,
  executeMarketingAction,
] as const;

  for (const handler of handlers) {

    if (typeof handler !== "function") {
  continue;
}
    const result = await handler(action);

    if (result) return result;
  }

  throw new Error("Cette action n’est pas encore disponible.");
}