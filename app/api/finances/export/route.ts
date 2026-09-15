import type { NextRequest } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();
  const filters = request.nextUrl.searchParams;
  const q = (filters.get("q") || "").trim().toLowerCase();
  const type = filters.get("type") || "";
  const statut = filters.get("statut") || "";
  const categorie = filters.get("categorie") || "";
  const suivi = filters.get("suivi") || "";

  const { data, error } = await supabase.from("finances").select(`
    id, titre, type, categorie, montant, statut, date_operation, created_at,
    artistes(id, nom), projets(id, titre), bookings(id, evenement)
  `).order("date_operation", { ascending: false }).order("created_at", { ascending: false });

  if (error) return new Response("Export financier indisponible.", { status: 500 });

  const rows = (data || []).filter((item: any) => {
    const searchable = [item.titre, item.categorie, item.artistes?.nom, item.projets?.titre, item.bookings?.evenement].filter(Boolean).join(" ").toLowerCase();
    return (!q || searchable.includes(q)) && (!type || item.type === type) && (!statut || item.statut === statut) && (!categorie || item.categorie === categorie) && matchesFollowup(item, suivi);
  });
  const header = ["Date", "Titre", "Type", "Catégorie", "Statut", "Montant EUR", "Artiste", "Projet", "Booking", "ID"];
  const csvRows = rows.map((item: any) => [
    item.date_operation || "", item.titre || "", item.type || "", item.categorie || "", item.statut || "",
    Number(item.montant || 0).toFixed(2).replace(".", ","), item.artistes?.nom || "", item.projets?.titre || "", item.bookings?.evenement || "", item.id,
  ]);
  const csv = `\uFEFF${[header, ...csvRows].map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
  const stamp = new Intl.DateTimeFormat("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lmg-finances-${stamp}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
function hasAttachment(finance: any) { return Boolean(finance.projets?.id || finance.artistes?.id || finance.bookings?.id); }
function isStale(finance: any) { if (!finance.date_operation || ["Payé", "Annulé"].includes(finance.statut)) return false; const date = new Date(`${finance.date_operation}T12:00:00`); const limit = new Date(); limit.setHours(0, 0, 0, 0); limit.setDate(limit.getDate() - 30); return !Number.isNaN(date.getTime()) && date < limit; }
function matchesFollowup(finance: any, suivi: string) { if (!suivi) return true; if (suivi === "ouvert") return !["Payé", "Annulé"].includes(finance.statut); if (suivi === "retard") return isStale(finance); if (suivi === "sans-rattachement") return finance.statut !== "Annulé" && !hasAttachment(finance); return true; }
