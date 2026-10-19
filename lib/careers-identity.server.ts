import "server-only";
export function careersIdentity() {
  return {
    name: process.env.CAREERS_CONTROLLER_NAME?.trim() || "Legacy Music Group",
    address: process.env.CAREERS_CONTROLLER_ADDRESS?.trim() || "138 avenue Victor-Hugo, 75016 Paris, France",
    registration: process.env.CAREERS_CONTROLLER_REGISTRATION?.trim() || "",
    status: process.env.CAREERS_CONTROLLER_REGISTRATION?.trim() ? "" : "Société en cours de formation",
    representative: process.env.CAREERS_CONTROLLER_REPRESENTATIVE?.trim() || "Joseph Kayaya",
    email: process.env.CAREERS_PRIVACY_EMAIL?.trim() || "candidature@lmgmusic.fr",
  };
}
export function careersIdentityReady() {
  const identity = careersIdentity();
  return Boolean(identity.name && identity.address && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email));
}
/** Enable only after the database migration and submission quota are configured. */
export function careersSubmissionsReady() {
  return careersIdentityReady() && process.env.CAREERS_SUBMISSIONS_ENABLED === "true" &&
    Boolean(process.env.CAREERS_RATE_LIMIT_SECRET && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}
