import AssistantChatClient from "@/components/AssistantChatClient";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AssistantChatPage() {
  await requireRole([ROLES.SUPER_ADMIN]);

  return <AssistantChatClient />;
}
