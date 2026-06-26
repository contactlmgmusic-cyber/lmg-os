import type { AssistantWorkflow } from "./types";

export function buildReleaseWorkflow(): AssistantWorkflow {
  return {
    type: "release",
    title: "Préparation de sortie",
    steps: [
      {
        id: "release-checklist",
        title: "Checklist Release Planner",
        actionType: "release.createChecklist",
        status: "pending",
      },
      {
        id: "marketing-tasks",
        title: "Tâches marketing",
        actionType: "marketing.createTasks",
        status: "pending",
      },
      {
        id: "calendar-events",
        title: "Événements calendrier",
        actionType: "calendar.createEvents",
        status: "pending",
      },
      {
        id: "media-campaign",
        title: "Campagne médias",
        actionType: "media.createCampaign",
        status: "pending",
      },
    ],
  };
}