import Link from "next/link";
import { notFound } from "next/navigation";
import RoyaltyPaymentForm from "@/components/RoyaltyPaymentForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { canGenerateRoyalties } from "@/lib/permissions";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER, ROLES.ARTISTE];

export default async function RoyaltyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireRole(allowed);
  const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: royalty, error } = await supabase.from("royalties").select(`
    id, nom, role, email, revenu_total, pourcentage, montant_du, statut,
    date_paiement, methode_paiement, reference_paiement, notes_paiement, created_at,
    projets(id, titre, artistes(id, nom))
  `).eq("id", id).single();

  if (error || !royalty) notFound();
  const project: any = Array.isArray(royalty.projets) ? royalty.projets[0] : royalty.projets;
  const artist: any = Array.isArray(project?.artistes) ? project.artistes[0] : project?.artistes;
  const paid = royalty.statut === "Payé";
  const expected = (Number(royalty.revenu_total || 0) * Number(royalty.pourcentage || 0)) / 100;
  const canManage = canGenerateRoyalties(profile.role);

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <Link href="/royalties" className="text-sm font-semibold text-zinc-500 hover:text-white">← Retour aux royalties</Link>
    <header className="mt-6 flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Détail du paiement</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">{royalty.nom || "Bénéficiaire"}</h1><p className="mt-3 text-zinc-500">{royalty.role || "Participant"} · {project?.titre || "Projet non lié"}</p></div>
      <div className="flex items-end gap-4"><div className="text-right"><p className="text-xs uppercase tracking-wider text-zinc-600">Montant dû</p><p className="mt-2 text-4xl font-black md:text-5xl">{euros(Number(royalty.montant_du || 0))}</p></div><Status paid={paid} /></div>
    </header>

    <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Panel eyebrow="Répartition" title="Base de calcul">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Info label="Projet" value={project?.titre || "Non lié"} />
            <Info label="Artiste" value={artist?.nom || "Non renseigné"} />
            <Info label="Bénéficiaire" value={royalty.nom || "Non renseigné"} />
            <Info label="Rôle" value={royalty.role || "Non renseigné"} />
            <Info label="Email" value={royalty.email || "Non renseigné"} />
            <Info label="Part du bénéficiaire" value={`${Number(royalty.pourcentage || 0)}%`} />
          </div>
          <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Calcul enregistré</p>
            <div className="mt-4 flex flex-col gap-3 text-lg sm:flex-row sm:items-center">
              <strong>{euros(Number(royalty.revenu_total || 0))}</strong><span className="text-zinc-700">×</span><strong>{Number(royalty.pourcentage || 0)}%</strong><span className="text-zinc-700">=</span><strong className="text-green-400">{euros(Number(royalty.montant_du || 0))}</strong>
            </div>
            {Math.abs(expected - Number(royalty.montant_du || 0)) > 0.01 && <p className="mt-4 text-xs text-yellow-400">Le montant enregistré diffère du calcul théorique de {euros(expected)}. Vérifie le split d’origine.</p>}
          </div>
        </Panel>

        <Panel eyebrow="Traçabilité" title={paid ? "Règlement enregistré" : "Paiement en attente"}>
          {paid ? <div className="grid gap-3 sm:grid-cols-2"><Info label="Date du paiement" value={formatDate(royalty.date_paiement)} /><Info label="Méthode" value={royalty.methode_paiement || "Non renseignée"} /><Info label="Référence" value={royalty.reference_paiement || "Non renseignée"} /><Info label="Notes" value={royalty.notes_paiement || "Aucune note"} /></div> : <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.05] p-5"><p className="font-semibold text-yellow-300">Ce montant n’est pas encore marqué comme payé.</p><p className="mt-2 text-sm leading-6 text-zinc-500">{canManage ? "Renseigne les informations du virement dans le panneau de règlement." : "La direction financière doit encore enregistrer le règlement."}</p></div>}
        </Panel>
      </div>

      <aside>
        {canManage ? <RoyaltyPaymentForm royalty={{ id: royalty.id, nom: royalty.nom || "Bénéficiaire", montantDu: Number(royalty.montant_du || 0), statut: royalty.statut || "À payer", datePaiement: royalty.date_paiement || "", methodePaiement: royalty.methode_paiement || "", referencePaiement: royalty.reference_paiement || "", notesPaiement: royalty.notes_paiement || "" }} /> : <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Consultation</p><h2 className="mt-2 text-2xl font-bold">Suivi du règlement</h2><p className="mt-3 text-sm leading-6 text-zinc-500">{paid ? "Le paiement a été enregistré par la direction. Les informations de règlement sont visibles dans la traçabilité." : "Le paiement est en attente. Seule la direction financière peut confirmer un règlement."}</p></section>}
      </aside>
    </section>
  </div></main>;
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{title}</h2><div className="mt-5">{children}</div></section>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-zinc-800 bg-black p-4"><p className="text-xs text-zinc-600">{label}</p><p className="mt-2 break-words font-semibold">{value}</p></div>; }
function Status({ paid }: { paid: boolean }) { return <span className={`rounded-full px-3 py-1 text-xs font-bold ${paid ? "bg-green-500/10 text-green-300" : "bg-yellow-500/10 text-yellow-300"}`}>{paid ? "Payé" : "À payer"}</span>; }
function euros(amount: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount || 0); }
function formatDate(input?: string | null) { if (!input) return "Non renseignée"; return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${input}T12:00:00`)); }
