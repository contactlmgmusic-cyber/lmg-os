export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  ARTISTE: "artiste",
  PRESTATAIRE: "prestataire",
} as const;

export type UserRole =
  (typeof ROLES)[keyof typeof ROLES];