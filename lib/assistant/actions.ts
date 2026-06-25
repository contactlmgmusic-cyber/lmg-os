export type AssistantAction = {
  type: string;
  label: string;
  payload?: {
    artisteId?: string;
    artiste?: string;
    sortieId?: string;
    projetId?: string;
  };
};