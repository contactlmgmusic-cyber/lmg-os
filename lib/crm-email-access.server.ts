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

type CrmEntity = {
  id: string;
  artiste_id?: string | null;
  projet_id?: string | null;
  responsable_id?: string | null;
};

function hasGlobalCrmAccess(
  role: string
) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role ===
      ROLES.ARTISTIC_DIRECTOR
  );
}

async function managerOwnsArtist({
  supabaseAdmin,
  userId,
  artisteId,
}: {
  supabaseAdmin: SupabaseClient;
  userId: string;
  artisteId: string;
}) {
  const {
    data: artiste,
    error,
  } = await supabaseAdmin
    .from("artistes")
    .select("id")
    .eq("id", artisteId)
    .eq("manager_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "Erreur vérification artiste CRM :",
      error
    );

    return false;
  }

  return Boolean(artiste);
}

async function managerOwnsProject({
  supabaseAdmin,
  userId,
  projetId,
}: {
  supabaseAdmin: SupabaseClient;
  userId: string;
  projetId: string;
}) {
  const {
    data: projet,
    error,
  } = await supabaseAdmin
    .from("projets")
    .select(
      `
        id,
        artistes!inner (
          manager_id
        )
      `
    )
    .eq("id", projetId)
    .eq(
      "artistes.manager_id",
      userId
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Erreur vérification projet CRM :",
      error
    );

    return false;
  }

  return Boolean(projet);
}

async function getCrmEntity({
  supabaseAdmin,
  entityType,
  entityId,
}: {
  supabaseAdmin: SupabaseClient;
  entityType: CrmEmailEntityType;
  entityId: string;
}): Promise<CrmEntity | null> {
  if (entityType === "prospect") {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("prospects_lmg")
      .select(
        "id, responsable_id"
      )
      .eq("id", entityId)
      .maybeSingle();

    if (error) {
      console.error(
        "Erreur chargement prospect CRM :",
        error
      );

      return null;
    }

    return data;
  }

  const tableName =
    entityType === "media"
      ? "medias"
      : entityType ===
        "influenceur"
      ? "influenceurs"
      : "partenaires";

  const {
    data,
    error,
  } = await supabaseAdmin
    .from(tableName)
    .select(
      "id, artiste_id, projet_id"
    )
    .eq("id", entityId)
    .maybeSingle();

  if (error) {
    console.error(
      `Erreur chargement ${entityType} CRM :`,
      error
    );

    return null;
  }

  return data;
}

export async function canAccessCrmEmailEntity({
  supabaseAdmin,
  userId,
  role,
  entityType,
  entityId,
}: CheckCrmEmailAccessParams) {
  if (
    hasGlobalCrmAccess(role)
  ) {
    return true;
  }

  if (role !== ROLES.MANAGER) {
    return false;
  }

  const entity =
    await getCrmEntity({
      supabaseAdmin,
      entityType,
      entityId,
    });

  if (!entity) {
    return false;
  }

  if (entityType === "prospect") {
    return (
      entity.responsable_id ===
      userId
    );
  }

  if (
    entity.artiste_id &&
    (await managerOwnsArtist({
      supabaseAdmin,
      userId,
      artisteId:
        entity.artiste_id,
    }))
  ) {
    return true;
  }

  if (
    entity.projet_id &&
    (await managerOwnsProject({
      supabaseAdmin,
      userId,
      projetId:
        entity.projet_id,
    }))
  ) {
    return true;
  }

  return false;
}