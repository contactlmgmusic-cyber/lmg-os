const hosts: Record<string, string[]> = {
  Instagram: ["instagram.com"], TikTok: ["tiktok.com"], YouTube: ["youtube.com", "youtu.be"],
  Spotify: ["spotify.com"], Deezer: ["deezer.com"], "Apple Music": ["music.apple.com"],
};
/** Accept stored handles or full URLs without duplicating the platform prefix. */
export function socialProfileUrl(platform: string, input: unknown): string | null {
  if (typeof input !== "string" || !hosts[platform]) return null;
  let value = input.trim();
  if (!value) return null;
  if (platform === "Spotify" && /^spotify:artist:[A-Za-z0-9]{22}$/.test(value)) value = `https://open.spotify.com/artist/${value.split(":")[2]}`;
  if (/^(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}\//i.test(value)) value = `https://${value}`;
  if (!/^https?:\/\//i.test(value)) {
    if (value.includes(":") || value.includes("/") || /[\s?#]/.test(value)) return null;
    const handle = value.replace(/^@/, "");
    if (!handle) return null;
    if (platform === "Instagram") value = `https://www.instagram.com/${encodeURIComponent(handle)}/`;
    else if (platform === "TikTok") value = `https://www.tiktok.com/@${encodeURIComponent(handle)}`;
    else if (platform === "YouTube") value = /^UC[A-Za-z0-9_-]{22}$/.test(handle) ? `https://www.youtube.com/channel/${handle}` : `https://www.youtube.com/@${encodeURIComponent(handle)}`;
    else if (platform === "Spotify" && /^[A-Za-z0-9]{22}$/.test(handle)) value = `https://open.spotify.com/artist/${handle}`;
    else if (platform === "Deezer" && /^\d+$/.test(handle)) value = `https://www.deezer.com/artist/${handle}`;
    else return null;
  }
  try {
    const url = new URL(value);
    if (url.username || url.password || !hosts[platform].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) return null;
    return url.href;
  } catch { return null; }
}
