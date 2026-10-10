"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabaseBrowser } from "@/lib/supabase-browser";

export default function InternalEventActions({ id, title, participantIds, mobile = false }: { id: string; title: string; participantIds: string[]; mobile?: boolean }) {
  const router = useRouter(); const [working, setWorking] = useState(false); const base = mobile ? "/mobile/agenda" : "/evenements";

  async function notify(message: string) {
    const { data: { user } } = await supabaseBrowser.auth.getUser(); if (!user) return;
    const recipients = participantIds.filter((userId) => userId !== user.id);
    if (recipients.length) await supabaseBrowser.from("notifications").insert(recipients.map((userId) => ({ user_id: userId, created_by: user.id, type: "Agenda", titre: message, description: title, lien: mobile ? `/mobile/agenda` : "/evenements", niveau: "Important", lu: false, is_read: false })));
  }

  async function cancelEvent() {
    if (!window.confirm("Annuler cet événement pour tous les participants ?")) return; setWorking(true);
    const { error } = await supabaseBrowser.from("internal_events").update({ statut: "Annulé", reminder_sent_at: new Date().toISOString() }).eq("id", id);
    if (error) { window.alert(error.message); setWorking(false); return; }
    await notify("Événement annulé"); router.refresh(); setWorking(false);
  }

  async function deleteEvent() {
    if (!window.confirm("Supprimer définitivement cet événement ?")) return; setWorking(true);
    await notify("Événement supprimé");
    const { error } = await supabaseBrowser.from("internal_events").delete().eq("id", id);
    if (error) { window.alert(error.message); setWorking(false); return; }
    router.replace(base); router.refresh();
  }

  return <div className="mt-6 grid gap-3 sm:grid-cols-3"><Link href={`${base}/interne/${id}/modifier`.replace("/evenements/interne", "/evenements")} className="rounded-xl bg-white px-4 py-3 text-center text-sm font-black text-black">Modifier</Link><button type="button" disabled={working} onClick={cancelEvent} className="rounded-xl border border-orange-500/30 px-4 py-3 text-sm font-black text-orange-400 disabled:opacity-50">Annuler</button><button type="button" disabled={working} onClick={deleteEvent} className="rounded-xl border border-red-500/30 px-4 py-3 text-sm font-black text-red-400 disabled:opacity-50">Supprimer</button></div>;
}
