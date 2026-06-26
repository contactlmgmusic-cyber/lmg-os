import type { AssistantIntent } from "./types";

export function detectIntent(message: string): AssistantIntent {
  const prompt = message.toLowerCase();

  if (
    prompt.includes("rollout") ||
    prompt.includes("sortie") ||
    prompt.includes("single") ||
    prompt.includes("ep") ||
    prompt.includes("album") ||
    prompt.includes("release") ||
    prompt.includes("lancement")
  ) {
    return "release";
  }

  if (
    prompt.includes("booking") ||
    prompt.includes("concert") ||
    prompt.includes("show") ||
    prompt.includes("festival")
  ) {
    return "booking";
  }

  if (
    prompt.includes("artiste") ||
    prompt.includes("signature") ||
    prompt.includes("signer")
  ) {
    return "artist";
  }

  if (
    prompt.includes("marketing") ||
    prompt.includes("communication") ||
    prompt.includes("promo")
  ) {
    return "marketing";
  }

  if (
    prompt.includes("dashboard") ||
    prompt.includes("kpi") ||
    prompt.includes("statistique")
  ) {
    return "dashboard";
  }

  return "unknown";
}