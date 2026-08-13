import "server-only";
import { ImapFlow } from "imapflow";

function getRequiredEnvironmentVariable(
  name: string
) {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Variable ${name} manquante.`
    );
  }

  return value;
}

export function createOvhImapClient() {
  const host =
    getRequiredEnvironmentVariable(
      "OVH_IMAP_HOST"
    );

  const user =
    getRequiredEnvironmentVariable(
      "OVH_IMAP_USER"
    );

  const password =
    getRequiredEnvironmentVariable(
      "OVH_IMAP_PASSWORD"
    );

  const portValue =
    getRequiredEnvironmentVariable(
      "OVH_IMAP_PORT"
    );

  const port = Number(portValue);

  if (
    !Number.isInteger(port) ||
    port <= 0
  ) {
    throw new Error(
      "Le port IMAP OVH est invalide."
    );
  }

  return new ImapFlow({
    host,
    port,
    secure: true,

    auth: {
      user,
      pass: password,
    },

    tls: {
      servername: host,
      rejectUnauthorized: true,
    },

    logger: false,

    emitLogs: false,

    disableAutoIdle: true,
  });
}