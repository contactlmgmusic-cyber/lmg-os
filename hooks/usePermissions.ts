"use client";

import { hasPermission } from "@/lib/auth/access-control";
import type { Permission } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/auth/roles";
import { useAuth } from "@/hooks/useAuth";

export function usePermissions() {
  const { profile, loading } = useAuth();

  const role =
    profile?.role === "member"
      ? undefined
      : (profile?.role as UserRole | undefined);

  return {
    role,
    loading,

    can(permission: Permission) {
      return hasPermission(role, permission);
    },
  };
}