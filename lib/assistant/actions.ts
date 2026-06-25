export type AssistantAction = {
  type: string;
  label: string;
  payload?: Record<string, any>;
};