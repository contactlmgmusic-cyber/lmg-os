import type { AssistantAction } from "./actions";

export type AssistantPlan = {
  summary: string;
  recommendations: string[];
  estimatedTime: string;
  actions: AssistantAction[];
};