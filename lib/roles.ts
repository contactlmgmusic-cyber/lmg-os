export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  ARTISTIC_DIRECTOR: "artistic_director",
  ARTISTE: "artiste",
  PRESTATAIRE: "prestataire",
} as const;

export type UserRole =
  (typeof ROLES)[keyof typeof ROLES];

export const INTERNAL_ROLES: UserRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.ARTISTIC_DIRECTOR,
  ROLES.ARTISTE,
  ROLES.PRESTATAIRE,
];

export const EXECUTIVE_ROLES: UserRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ARTISTIC_DIRECTOR,
];

export function isUserRole(role: string | null | undefined): role is UserRole {
  return Boolean(role && INTERNAL_ROLES.includes(role as UserRole));
}

export function getRoleHome(role: string | null | undefined) {
  switch (role) {
    case ROLES.MANAGER:
      return "/manager";
    case ROLES.ARTISTE:
      return "/mon-espace-artiste";
    case ROLES.PRESTATAIRE:
      return "/mes-taches";
    default:
      return "/dashboard";
  }
}
