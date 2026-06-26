import type { AssistantAction } from "./actions";
import type { AssistantWorkflow } from "./workflows/types";

export type AssistantPlan = {
  summary: string;
  recommendations: string[];
  estimatedTime: string;
  actions: AssistantAction[];
  workflow?: AssistantWorkflow | null;
};