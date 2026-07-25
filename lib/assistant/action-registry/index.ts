import type { AssistantAction } from "../actions";
import { executeReleaseAction } from "./release";
import { executeMarketingAction } from "./marketing";

export async function executeAssistantAction(action: AssistantAction) {
  const handlers = [
    executeReleaseAction,
    executeMarketingAction,
  ];

  for (const handler of handlers) {
    const result = await handler(action);

    if (result) return result;
  }

  throw new Error("Cette action n’est pas encore disponible.");
}