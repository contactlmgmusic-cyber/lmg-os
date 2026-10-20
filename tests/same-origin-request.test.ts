import assert from "node:assert/strict";
import test from "node:test";
import { isSameOriginMutation } from "../lib/same-origin-request.server";

test("accepts a mutation from the same origin", () => {
  const request = new Request("https://os.lmgmusic.fr/api/careers/jobs", { method: "POST", headers: { origin: "https://os.lmgmusic.fr" } });
  assert.equal(isSameOriginMutation(request), true);
});

test("rejects cross-origin and origin-less mutations", () => {
  assert.equal(isSameOriginMutation(new Request("https://os.lmgmusic.fr/api/careers/jobs", { method: "POST", headers: { origin: "https://evil.example" } })), false);
  assert.equal(isSameOriginMutation(new Request("https://os.lmgmusic.fr/api/careers/jobs", { method: "POST" })), false);
});
