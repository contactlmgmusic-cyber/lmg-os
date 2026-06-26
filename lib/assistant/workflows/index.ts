import type { AssistantWorkflow } from "./types";
import { buildReleaseWorkflow } from "./release";
import type { AssistantIntent } from "../intents/types";

export function buildWorkflowForIntent(
  intent: AssistantIntent
): AssistantWorkflow | null {
  if (intent === "release") {
    return buildReleaseWorkflow();
  }

  return null;
}