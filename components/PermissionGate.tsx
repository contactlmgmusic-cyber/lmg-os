import {
  canManageProjects,
  canManageTasks,
  canManageTeam,
  canUploadAssets,
  canManagePartenaires,
} from "@/lib/permissions";

export default function PermissionGate({
  role,
  permission,
  children,
}: {
  role?: string | null;
  permission: "team" | "projects" | "tasks" | "assets" | "partenaires";
  children: React.ReactNode;
}) {
  const allowed =
  permission === "team"
    ? canManageTeam(role)
    : permission === "projects"
    ? canManageProjects(role)
    : permission === "tasks"
    ? canManageTasks(role)
    : permission === "partenaires"
    ? canManagePartenaires(role)
    : canUploadAssets(role);

  if (!allowed) return null;

  return <>{children}</>;
}