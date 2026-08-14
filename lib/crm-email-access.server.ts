import "server-only";

import type {
  SupabaseClient,
} from "@supabase/supabase-js";
import { ROLES } from "@/lib/roles";

export type CrmEmailEntityType =
  | "media"
  | "influenceur"
  | "partenaire"
  | "prospect";

type CheckCrmEmailAccessParams = {
  supabaseAdmin: SupabaseClient;
  userId: string;
  role: string;
  entityType: CrmEmailEntityType;
  entityId: string;
};

function hasCrmEmailAccess(
  role: string
) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.ARTISTIC_DIRECTOR
  );
}

export async function canAccessCrmEmailEntity({
  role,
}: CheckCrmEmailAccessParams) {
  /*
   * Les managers n’ont aucun accès aux e-mails CRM,
   * même lorsque la fiche concerne l’un de leurs artistes.
   */
  return hasCrmEmailAccess(role);
}