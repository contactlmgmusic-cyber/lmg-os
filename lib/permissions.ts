import { ROLES } from "./roles";

export function canAccessAdmin(role?: string | null) {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

export function canManageArtists(role?: string | null) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.MANAGER
  );
}

export function canManageProjects(role?: string | null) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.MANAGER
  );
}

export function canManageTasks(role?: string | null) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.MANAGER ||
    role === ROLES.PRESTATAIRE
  );
}

export function canManageTeam(role?: string | null) {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

export function canUploadAssets(role?: string | null) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.MANAGER
  );
}

export function canViewFinances(role?: string | null) {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

export function canGenerateRoyalties(role?: string | null) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.MANAGER
  );
}

export function canViewRoyalties(role?: string | null) {
  return role !== ROLES.PRESTATAIRE;
}

export function canUseAssistant(role?: string | null) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.MANAGER
  );
}