export type AssistantWorkflowStep = {
  id: string;
  title: string;
  actionType: string;
  status: "pending" | "done" | "failed";
};

export type AssistantWorkflow = {
  type: string;
  title: string;
  steps: AssistantWorkflowStep[];
};
