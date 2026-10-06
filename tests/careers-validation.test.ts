import { test } from "node:test";
import assert from "node:assert/strict";
import { validateApplication, validateCv } from "../lib/careers-validation";
const application = () => { const form = new FormData(); form.set("first_name", "Yli"); form.set("last_name", "Test"); form.set("email", "TEST@example.com"); form.set("application_type", "spontaneous"); form.set("department_interest", "creative"); return form; };
test("spontaneous application accepts a normalized email and does not require a job", () => { const value = validateApplication(application()); assert.equal(value.email,"test@example.com"); assert.equal(value.job_slug,null); });
test("rejects executable portfolio URLs, invalid email and oversized text", () => { for (const [field,value] of [["portfolio_url","javascript:alert(1)"],["email","invalid"],["first_name","x".repeat(101)]]) { const form=application(); form.set(field,value); assert.throws(()=>validateApplication(form)); } });
test("job application must have a job slug", () => { const form=application(); form.set("application_type","job"); assert.throws(()=>validateApplication(form)); });
test("CV checks content as well as advertised MIME and extension", async () => { assert.equal(await validateCv(new File(["%PDF-1.7\n"],"cv.pdf",{type:"application/pdf"})),"pdf"); await assert.rejects(validateCv(new File(["fake PDF"],"cv.pdf",{type:"application/pdf"}))); await assert.rejects(validateCv(new File(["%PDF-1.7"],"cv.exe",{type:"application/pdf"}))); await assert.rejects(validateCv(new File([],"cv.pdf",{type:"application/pdf"}))); });
