export type UserRole = "admin" | "manager" | "member" | "artist" | "guest";

export function canManageTeam(role?: string | null) {
  return role === "admin";
}

export function canManageProjects(role?: string | null) {
  return role === "admin" || role === "manager";
}

export function canManageTasks(role?: string | null) {
  return role === "admin" || role === "manager" || role === "member";
}

export function canUploadAssets(role?: string | null) {
  return role === "admin" || role === "manager" || role === "member";
}

export function isReadOnly(role?: string | null) {
  return role === "guest" || role === "artist";
}