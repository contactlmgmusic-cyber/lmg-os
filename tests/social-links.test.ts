import { test } from "node:test";
import assert from "node:assert/strict";
import { socialProfileUrl } from "../lib/social-links";
test("social links accept handles and complete URLs without double prefixes", () => {
  assert.equal(socialProfileUrl("Instagram", "@music.lmg"), "https://www.instagram.com/music.lmg/");
  assert.equal(socialProfileUrl("Instagram", " https://www.instagram.com/music.lmg/ "), "https://www.instagram.com/music.lmg/");
  assert.equal(socialProfileUrl("TikTok", "@music.lmg"), "https://www.tiktok.com/@music.lmg");
  assert.equal(socialProfileUrl("TikTok", "www.tiktok.com/@music.lmg"), "https://www.tiktok.com/@music.lmg");
});
test("YouTube handles and Spotify artist URIs resolve to external profiles", () => {
  assert.equal(socialProfileUrl("YouTube", "@LMGMusic"), "https://www.youtube.com/@LMGMusic");
  assert.equal(socialProfileUrl("Spotify", "spotify:artist:1234567890123456789012"), "https://open.spotify.com/artist/1234567890123456789012");
});
test("malformed social links cannot become OS-relative or executable links", () => {
  for (const value of ["javascript:alert(1)", "/artistes/id", "https://instagram.com.evil.test/a", "https://user:password@instagram.com/a", "", null]) assert.equal(socialProfileUrl("Instagram", value), null);
  assert.equal(socialProfileUrl("Spotify", "not-a-spotify-id"), null);
});
