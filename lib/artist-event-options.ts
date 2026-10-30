export const ARTIST_EVENT_TYPE_GROUPS = [
  {
    label: "Live & booking",
    options: [
      "Concert",
      "Showcase",
      "DJ set",
      "Festival",
      "Première partie",
      "Booking / prestation privée",
      "Release party",
    ],
  },
  {
    label: "Production & promotion",
    options: [
      "Répétition",
      "Balance / soundcheck",
      "Session studio",
      "Shooting photo",
      "Tournage clip",
      "Interview / média",
      "Événement promo",
      "Apparition publique",
    ],
  },
  {
    label: "Organisation",
    options: ["Rendez-vous manager", "Déplacement", "Autre"],
  },
] as const;

export const ARTIST_EVENT_TYPES = ARTIST_EVENT_TYPE_GROUPS.flatMap(
  (group) => group.options
);
