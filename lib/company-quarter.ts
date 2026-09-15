export function getActiveCompanyQuarter(now = new Date()) {
  const date = now.toISOString().slice(0, 10);

  // LMG lance exceptionnellement le pilotage T4 2026 dès le 14 septembre.
  if (date >= "2026-09-14" && date <= "2026-12-31") return "2026-T4";

  return `${now.getUTCFullYear()}-T${Math.floor(now.getUTCMonth() / 3) + 1}`;
}

export function getCompanyQuarterEnd(quarter: string) {
  const [year, quarterNumber] = quarter.split("-T").map(Number);
  return new Date(Date.UTC(year, quarterNumber * 3, 0)).toISOString().split("T")[0];
}
