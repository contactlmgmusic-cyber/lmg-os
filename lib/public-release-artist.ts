/** Public credits confirmed by LMG; does not publish a private artist profile. */
export function publicReleaseArtist<T extends { nom?: string | null }>(artists: T | T[] | null | undefined, slug: string | null | undefined): T | null {
  const artist = Array.isArray(artists) ? artists[0] : artists;
  if (artist?.nom) return artist;
  if (["troisieme-projet", "premier-projet", "quatrieme-projet"].includes(slug || "")) return { ...artist, nom: "LAAM" } as T;
  return artist || null;
}
