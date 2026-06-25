import { planAssistantActions } from "./planner";

export function runAssistantEngine(message: string) {
  return {
    actions: planAssistantActions(message),
  };
}