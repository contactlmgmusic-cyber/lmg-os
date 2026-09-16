import RoleRouteGuard from "@/components/RoleRouteGuard";
import { ROLES } from "@/lib/roles";
export default function Layout({ children }: { children: React.ReactNode }) { return <RoleRouteGuard roles={[ROLES.SUPER_ADMIN]}>{children}</RoleRouteGuard>; }
