import Link from "next/link";
import { notFound } from "next/navigation";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

export default async function MobileEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createAuthenticatedSupabaseClient();
  const { data: event } = await supabase.from("artiste_events").select("*").eq("id", id).maybeSingle();
  if (!event) notFound();
  return <div className="px-5 py-6"><Link href="/mobile/agenda" className="text-xs font-bold text-zinc-600">‹ Agenda</Link><section className="mt-5 rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-6"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f2b705]">{event.type || "Événement artiste"}</p><h1 className="mt-4 text-2xl font-black">{event.titre || "Événement"}</h1><div className="mt-6 grid grid-cols-2 gap-3"><Info label="Date" value={event.date_event ? formatDate(event.date_event) : "Non renseignée"} /><Info label="Lieu" value={event.lieu || "Non renseigné"} /><Info label="Heure" value={event.heure || "Non renseignée"} /><Info label="Statut" value={event.statut || "À confirmer"} /></div>{event.description && <div className="mt-5 border-t border-white/[0.07] pt-5"><p className="text-sm leading-6 text-zinc-400">{event.description}</p></div>}</section></div>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-[16px] bg-black/50 p-3"><p className="text-[8px] uppercase tracking-wider text-zinc-700">{label}</p><p className="mt-1.5 text-xs font-bold text-zinc-300">{value}</p></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
