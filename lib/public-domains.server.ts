import "server-only";
import { headers } from "next/headers";
export const MUSIC_ORIGIN = "https://www.lmgmusic.fr";
export async function publicDomain() {
  const host = (await headers()).get("host")?.split(":")[0];
  if (host === "careers.lmgmusic.fr") return { kind: "careers", origin: "https://careers.lmgmusic.fr" };
  if (host === "artistportal.lmgmusic.fr") return { kind: "artist", origin: "https://artistportal.lmgmusic.fr" };
  if (host === "os.lmgmusic.fr") return { kind: "os", origin: "https://os.lmgmusic.fr" };
  if (host === "lmgmusic.fr" || host === "www.lmgmusic.fr") return { kind: "music", origin: MUSIC_ORIGIN };
  return { kind: "preview", origin: MUSIC_ORIGIN };
}
