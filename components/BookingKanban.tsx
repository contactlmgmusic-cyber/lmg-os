"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabaseBrowser } from "@/lib/supabase-browser";

const statuses = ["Prospect", "Contacté", "Négociation", "Option", "Confirmé", "Facturé", "Payé", "Annulé"];

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Date à définir";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function normalizeStatus(status?: string | null) {
  if (!status) return "Prospect";
  if (["Relance", "Relancé"].includes(status)) return "Contacté";
  if (status === "En négociation") return "Négociation";
  if (status === "Refusé") return "Annulé";
  return status;
}

function tone(status: string) {
  if (status === "Confirmé") return "border-green-500/30 bg-green-500/10";
  if (status === "Facturé") return "border-blue-500/30 bg-blue-500/10";
  if (status === "Payé") return "border-emerald-500/30 bg-emerald-500/10";
  if (status === "Annulé") return "border-red-500/30 bg-red-500/10";
  if (status === "Option") return "border-yellow-500/30 bg-yellow-500/10";
  return "border-zinc-800 bg-zinc-900";
}

export default function BookingKanban({ bookings }: { bookings: any[] }) {
  const [items, setItems] = useState(bookings);
  const [view, setView] = useState<"pipeline" | "agenda">("pipeline");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");
  const [artist, setArtist] = useState("Tous");

  const artists = useMemo(() => Array.from(new Set(items.map((item) => item.artistes?.nom).filter(Boolean))) as string[], [items]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const current = normalizeStatus(item.statut);
      const textMatch = !query || item.evenement?.toLowerCase().includes(query) || item.organisateur?.toLowerCase().includes(query) || item.ville?.toLowerCase().includes(query) || item.artistes?.nom?.toLowerCase().includes(query);
      return Boolean(textMatch && (status === "Tous" || current === status) && (artist === "Tous" || item.artistes?.nom === artist));
    });
  }, [items, search, status, artist]);

  async function notifyAdmins(booking: any) {
    const { data: admins } = await supabaseBrowser.from("profiles").select("id").in("role", ["super_admin", "admin"]);
    if (!admins?.length) return;
    await supabaseBrowser.from("notifications").insert(admins.map((admin) => ({ user_id: admin.id, type: "booking", titre: "Booking confirmé", description: booking.evenement || "Nouvelle date confirmée", link: `/booking/${booking.id}` })));
  }

  async function updateStatus(id: string, newStatus: string) {
    const previous = items;
    const booking = items.find((item) => item.id === id);
    if (!booking || normalizeStatus(booking.statut) === newStatus) return;
    setItems((current) => current.map((item) => item.id === id ? { ...item, statut: newStatus } : item));
    const { error } = await supabaseBrowser.from("bookings").update({ statut: newStatus }).eq("id", id);
    if (error) { setItems(previous); alert(error.message); return; }
    if (newStatus === "Confirmé") await notifyAdmins(booking);
  }

  function BookingCard({ booking, index, draggable = false }: { booking: any; index: number; draggable?: boolean }) {
    const cachet = Number(booking.montant_cachet || booking.cachet || 0);
    const commission = Number(booking.montant_commission || 0) || cachet * Number(booking.commission_lmg || 0) / 100;
    const content = (
      <Link href={`/booking/${booking.id}`} className="block rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-600">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><p className="truncate font-semibold">{booking.evenement || "Événement"}</p><p className="mt-1 text-sm text-zinc-500">{booking.artistes?.nom || "Artiste non lié"}</p></div>
          {cachet > 0 && <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-black">{formatMoney(cachet)}</span>}
        </div>
        <div className="mt-4 space-y-1 text-sm text-zinc-400"><p>{booking.organisateur || "Organisateur à définir"}</p><p>{booking.ville || "Ville à définir"} · {formatDate(booking.date_event)}</p>{commission > 0 && <p className="pt-2 text-emerald-300">Commission LMG : {formatMoney(commission)}</p>}{booking.prochaine_relance && <p className="text-yellow-300">Relance : {formatDate(booking.prochaine_relance)}</p>}</div>
      </Link>
    );
    if (!draggable) return content;
    return <Draggable draggableId={booking.id} index={index}>{(provided) => <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>{content}</div>}</Draggable>;
  }

  return (
    <div>
      <section className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un événement, artiste ou organisateur..." className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none focus:border-zinc-600" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm"><option>Tous</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={artist} onChange={(event) => setArtist(event.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm"><option>Tous</option>{artists.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <div className="flex rounded-xl border border-zinc-800 bg-black p-1">{(["pipeline", "agenda"] as const).map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-lg px-4 py-2 text-sm capitalize ${view === item ? "bg-white text-black" : "text-zinc-400"}`}>{item}</button>)}</div>
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-600">{filtered.length} opportunité(s) affichée(s)</p>
      </section>

      {view === "pipeline" ? (
        <DragDropContext onDragEnd={(result) => result.destination && updateStatus(result.draggableId, result.destination.droppableId)}>
          <div className="flex gap-5 overflow-x-auto pb-4">
            {statuses.map((column) => { const columnItems = filtered.filter((item) => normalizeStatus(item.statut) === column); const total = columnItems.reduce((sum, item) => sum + Number(item.montant_cachet || item.cachet || 0), 0); return (
              <Droppable droppableId={column} key={column}>{(provided) => <section ref={provided.innerRef} {...provided.droppableProps} className={`min-h-[440px] min-w-[300px] rounded-3xl border p-4 ${tone(column)}`}>
                <div className="mb-5 flex items-start justify-between"><div><h2 className="font-semibold">{column}</h2><p className="mt-1 text-xs text-zinc-500">{formatMoney(total)}</p></div><span className="rounded-full bg-black px-2.5 py-1 text-xs text-zinc-400">{columnItems.length}</span></div>
                <div className="space-y-3">{columnItems.map((booking, index) => <BookingCard key={booking.id} booking={booking} index={index} draggable />)}{provided.placeholder}</div>
              </section>}</Droppable>
            ); })}
          </div>
        </DragDropContext>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
          {filtered.length === 0 ? <p className="p-8 text-zinc-500">Aucun booking ne correspond aux filtres.</p> : [...filtered].sort((a, b) => (a.date_event || "9999").localeCompare(b.date_event || "9999")).map((booking, index) => (
            <div key={booking.id} className="grid border-b border-zinc-800 last:border-0 md:grid-cols-[180px_1fr_150px] md:items-center">
              <div className="border-b border-zinc-800 p-5 md:border-b-0 md:border-r"><p className="font-semibold">{formatDate(booking.date_event)}</p><p className="mt-1 text-xs text-zinc-600">Date {String(index + 1).padStart(2, "0")}</p></div>
              <div className="p-4"><BookingCard booking={booking} index={index} /></div>
              <div className="px-5 pb-5 md:p-5 md:text-right"><span className={`rounded-full border px-3 py-1 text-xs ${tone(normalizeStatus(booking.statut))}`}>{normalizeStatus(booking.statut)}</span></div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
