import { test } from "node:test";
import assert from "node:assert/strict";
import { PayloadTooLarge, readLimitedFormData } from "../lib/limited-form-data";
test("accepts bounded form data and rejects an oversized body without Content-Length", async () => {
  const form = new FormData(); form.set("name","test");
  const accepted = await readLimitedFormData(new Request("https://example.com",{method:"POST",body:form}),1024);
  assert.equal(accepted.get("name"),"test");
  await assert.rejects(readLimitedFormData(new Request("https://example.com",{method:"POST",body:"x".repeat(1025)}),1024),PayloadTooLarge);
});
