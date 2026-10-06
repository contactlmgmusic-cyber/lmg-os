import { test } from "node:test";
import assert from "node:assert/strict";
import { calendarDateKey, validMonth } from "../lib/calendar-dates";
test("date-only releases preserve the day across server timezones", () => { assert.equal(calendarDateKey("2026-10-06"),"2026-10-06"); });
test("late UTC timestamps appear on the correct Paris date in winter and summer", () => { assert.equal(calendarDateKey("2026-10-06T22:30:00Z"),"2026-10-07"); assert.equal(calendarDateKey("2026-01-06T23:30:00Z"),"2026-01-07"); });
test("reject invalid months and invalid timestamps", () => { assert.equal(validMonth("2026-99",new Date("2026-10-06T12:00:00Z")),"2026-10"); assert.equal(calendarDateKey("not-a-date"),""); });
