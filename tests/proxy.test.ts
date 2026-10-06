import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch, getRewrittenUrl } from "next/experimental/testing/server";
import { config, proxy } from "../proxy";
test("proxy protects dynamic dotted routes while skipping API and static assets", () => {
  const matches = (url: string) => unstable_doesMiddlewareMatch({ config, nextConfig: {}, url });
  assert.equal(matches("/projets/artist.v2"),true);
  assert.equal(matches("/apiary"),true);
  assert.equal(matches("/api/careers/applications"),false);
  assert.equal(matches("/team/yli.jpg"),false);
  assert.equal(matches("/robots.txt"),false);
});
test("public domains rewrite to their own namespaces and hide internal prefixes", async () => {
  for (const [origin,prefix] of [["https://careers.lmgmusic.fr","careers"],["https://artistportal.lmgmusic.fr","artistportal"]]) {
    const response=await proxy(new NextRequest(`${origin}/`));
    assert.equal(getRewrittenUrl(response),`${origin}/${prefix}`);
    const canonical=await proxy(new NextRequest(`${origin}/${prefix}`));
    assert.equal(canonical.headers.get("location"),`${origin}/`);
  }
});
test("Music aliases and explicit maintenance route do not enter namespace loops", async () => {
  const alias=await proxy(new NextRequest("https://www.lmgmusic.fr/artists"));
  assert.equal(alias.headers.get("location"),"https://www.lmgmusic.fr/artistes");
  const maintenance=await proxy(new NextRequest("https://www.lmgmusic.fr/maintenance"));
  assert.equal(maintenance.headers.get("x-middleware-next"),"1");
});
