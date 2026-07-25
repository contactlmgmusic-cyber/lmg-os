import type { Permission } from "./permissions";
import {
  ROLE_PERMISSIONS,
  type UserRole,
} from "./roles";

export function hasPermission(
  role: UserRole | null | undefined,
  permission: Permission
): boolean {
  if (!role) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions) {
    return false;
  }

  return permissions.includes(permission);
}

export function hasAnyPermission(
  role: UserRole | null | undefined,
  permissions: readonly Permission[]
): boolean {
  return permissions.some((permission) =>
    hasPermission(role, permission)
  );
}

export function hasAllPermissions(
  role: UserRole | null | undefined,
  permissions: readonly Permission[]
): boolean {
  return permissions.every((permission) =>
    hasPermission(role, permission)
  );
}