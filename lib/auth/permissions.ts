export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_CEO_VIEW: "dashboard.ceo.view",
  DASHBOARD_ARTISTIC_VIEW: "dashboard.artistic.view",

  // Artistes
  ARTISTS_VIEW: "artists.view",
  ARTISTS_CREATE: "artists.create",
  ARTISTS_UPDATE: "artists.update",
  ARTISTS_ARCHIVE: "artists.archive",
  ARTISTS_DELETE: "artists.delete",

  // Projets
  PROJECTS_VIEW: "projects.view",
  PROJECTS_CREATE: "projects.create",
  PROJECTS_UPDATE: "projects.update",
  PROJECTS_ARCHIVE: "projects.archive",
  PROJECTS_DELETE: "projects.delete",

  // Releases
  RELEASES_VIEW: "releases.view",
  RELEASES_CREATE: "releases.create",
  RELEASES_UPDATE: "releases.update",
  RELEASES_DELETE: "releases.delete",

  // Médias
  MEDIA_VIEW: "media.view",
  MEDIA_CREATE: "media.create",
  MEDIA_UPDATE: "media.update",
  MEDIA_DELETE: "media.delete",

  // Marketing
  MARKETING_VIEW: "marketing.view",
  MARKETING_CREATE: "marketing.create",
  MARKETING_UPDATE: "marketing.update",
  MARKETING_DELETE: "marketing.delete",

  // Calendrier
  CALENDAR_VIEW: "calendar.view",
  CALENDAR_CREATE: "calendar.create",
  CALENDAR_UPDATE: "calendar.update",
  CALENDAR_DELETE: "calendar.delete",

  // Tâches
  TASKS_VIEW: "tasks.view",
  TASKS_CREATE: "tasks.create",
  TASKS_UPDATE: "tasks.update",
  TASKS_DELETE: "tasks.delete",
  TASKS_ASSIGN: "tasks.assign",

  // Discussions
  DISCUSSIONS_VIEW: "discussions.view",
  DISCUSSIONS_CREATE: "discussions.create",
  DISCUSSIONS_MODERATE: "discussions.moderate",

  // Bookings
  BOOKINGS_VIEW: "bookings.view",
  BOOKINGS_CREATE: "bookings.create",
  BOOKINGS_UPDATE: "bookings.update",
  BOOKINGS_DELETE: "bookings.delete",
  BOOKINGS_FINANCIAL_VIEW: "bookings.financial.view",

  // CRM
  CRM_VIEW: "crm.view",
  CRM_CREATE: "crm.create",
  CRM_UPDATE: "crm.update",
  CRM_DELETE: "crm.delete",

  // Contrats
  CONTRACTS_VIEW: "contracts.view",
  CONTRACTS_CREATE: "contracts.create",
  CONTRACTS_UPDATE: "contracts.update",
  CONTRACTS_DELETE: "contracts.delete",

  // Royalties
  ROYALTIES_VIEW: "royalties.view",
  ROYALTIES_CREATE: "royalties.create",
  ROYALTIES_UPDATE: "royalties.update",

  // Finances
  FINANCE_VIEW: "finance.view",
  FINANCE_CREATE: "finance.create",
  FINANCE_UPDATE: "finance.update",
  FINANCE_DELETE: "finance.delete",

  // Équipe
  TEAM_VIEW: "team.view",
  TEAM_MANAGE: "team.manage",

  // Utilisateurs et rôles
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",

  // Paramètres et administration
  SETTINGS_VIEW: "settings.view",
  SETTINGS_MANAGE: "settings.manage",
  ACTIVITY_LOG_VIEW: "activity-log.view",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];