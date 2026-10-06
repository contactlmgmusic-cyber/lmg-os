/** Date-only values keep their day; timestamps are displayed in the LMG business timezone. */
export function calendarDateKey(value: string | Date): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find(item => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function validMonth(value: string | undefined, now = new Date()) {
  return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : calendarDateKey(now).slice(0, 7);
}
