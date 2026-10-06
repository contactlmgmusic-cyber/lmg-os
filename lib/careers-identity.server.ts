import "server-only";
export function careersIdentity() {
  return {
    name: process.env.CAREERS_CONTROLLER_NAME?.trim() || "",
    address: process.env.CAREERS_CONTROLLER_ADDRESS?.trim() || "",
    registration: process.env.CAREERS_CONTROLLER_REGISTRATION?.trim() || "",
    email: process.env.CAREERS_PRIVACY_EMAIL?.trim() || "",
  };
}
export function careersIdentityReady() {
  const identity = careersIdentity();
  return Boolean(identity.name && identity.address && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email));
}
