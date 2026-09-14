export const INTERNAL_PROJECT_TAXONOMY = {
  Direction: ["Organisation interne", "Stratégie", "Pilotage & KPI", "Juridique", "Finance"],
  Artistique: ["Direction artistique", "Développement artiste", "Production musicale", "Répertoire & A&R"],
  Marketing: ["Communication", "Contenu", "Réseaux sociaux", "Campagne promotionnelle", "Partenariats"],
  Opérations: ["Booking", "Événement", "Processus & procédures", "Outils & systèmes", "Logistique"],
  "LMG Agency": ["Prospection", "Projet client", "Offre & service", "Développement commercial"],
  Administration: ["Ressources humaines", "Contrats", "Conformité", "Documentation"],
} as const;

export type InternalProjectPole = keyof typeof INTERNAL_PROJECT_TAXONOMY;

export const INTERNAL_PROJECT_POLES = Object.keys(
  INTERNAL_PROJECT_TAXONOMY
) as InternalProjectPole[];

export function categoriesForPole(pole: string) {
  return INTERNAL_PROJECT_TAXONOMY[pole as InternalProjectPole] || [];
}
