export type DriveFileCategory =
  | "Master"
  | "Cover"
  | "Clip"
  | "Photo presse"
  | "EPK"
  | "Contrat"
  | "Document interne"
  | "Autre";

export type DriveEntityType =
  | "artist"
  | "project";

export type DriveRoutePlan = {
  anchorFolderId: string;
  bindingRole: string;
  entityType: DriveEntityType | null;
  entityId: string | null;
  entityFolderName: string | null;
  trailingFolders: string[];
};

// Identifiants relevés dans le Drive central « LEGACY MUSIC GROUP ».
// Les dossiers dynamiques sont enregistrés en base après leur première
// résolution : les prochains uploads ne dépendent donc plus de leur nom.
export const LMG_DRIVE_FOLDERS = {
  artistsActive:
    "10QdwRqI70n9g79142TN_ZDtyqcj1jAs5",
  artistContracts:
    "19vpNVmvsK6hXU14hrqIpRzL-GEgnyg0B",
  releaseMasters:
    "1O-QThIFlEoA5QO7qZh7s024p1FK0SAOT",
  releaseCovers:
    "1fkt04j7bm8NBtdafgdPJsI2BI50iIStG",
  releaseRollout:
    "1yBc1A6m9VXaejX7MvG8W1SyM8cP2BM6v",
  artistCommunication:
    "1KQK8PbyjvxsJBZQILHAup1l__uiAA41F",
  internalBriefs:
    "1FCQYtdiBWQid_8ZuUbYKmvNfNdpA9Bpw",
} as const;

type RouteInput = {
  category: DriveFileCategory;
  artistId: string | null;
  artistName: string | null;
  projectId: string | null;
  projectName: string | null;
};

function projectOrArtist(input: RouteInput) {
  if (input.projectId && input.projectName) {
    return {
      entityType: "project" as const,
      entityId: input.projectId,
      entityFolderName: input.projectName,
    };
  }

  if (input.artistId && input.artistName) {
    return {
      entityType: "artist" as const,
      entityId: input.artistId,
      entityFolderName: input.artistName,
    };
  }

  return {
    entityType: null,
    entityId: null,
    entityFolderName: null,
  };
}

export function getLmgDriveRoutePlan(
  input: RouteInput
): DriveRoutePlan {
  const releaseEntity =
    projectOrArtist(input);

  if (input.category === "Master") {
    return {
      anchorFolderId:
        LMG_DRIVE_FOLDERS.releaseMasters,
      bindingRole: "release_masters",
      ...releaseEntity,
      trailingFolders: [],
    };
  }

  if (input.category === "Cover") {
    return {
      anchorFolderId:
        LMG_DRIVE_FOLDERS.releaseCovers,
      bindingRole: "release_covers",
      ...releaseEntity,
      trailingFolders: [],
    };
  }

  if (input.category === "Clip") {
    return {
      anchorFolderId:
        LMG_DRIVE_FOLDERS.releaseRollout,
      bindingRole: "release_rollout",
      ...releaseEntity,
      trailingFolders: ["Clips"],
    };
  }

  if (
    input.category === "Photo presse" ||
    input.category === "EPK"
  ) {
    return {
      anchorFolderId:
        LMG_DRIVE_FOLDERS.artistCommunication,
      bindingRole: "artist_communication",
      entityType: input.artistId
        ? "artist"
        : null,
      entityId: input.artistId,
      entityFolderName: input.artistName,
      trailingFolders: [input.category],
    };
  }

  if (input.category === "Contrat") {
    return {
      anchorFolderId:
        LMG_DRIVE_FOLDERS.artistContracts,
      bindingRole: "artist_contracts",
      entityType: input.artistId
        ? "artist"
        : null,
      entityId: input.artistId,
      entityFolderName: input.artistName,
      trailingFolders: ["01 — Brouillons"],
    };
  }

  if (input.artistId && input.artistName) {
    return {
      anchorFolderId:
        LMG_DRIVE_FOLDERS.artistsActive,
      bindingRole: "artist_management",
      entityType: "artist",
      entityId: input.artistId,
      entityFolderName: input.artistName,
      trailingFolders:
        input.category === "Document interne"
          ? [
              "03 — Suivi Management",
              "Documents internes",
            ]
          : [
              "01 — Profil & Informations",
              "Autres",
            ],
    };
  }

  return {
    anchorFolderId:
      LMG_DRIVE_FOLDERS.internalBriefs,
    bindingRole: "unlinked_internal",
    entityType: null,
    entityId: null,
    entityFolderName: null,
    trailingFolders: ["Imports LMG OS à classer"],
  };
}
