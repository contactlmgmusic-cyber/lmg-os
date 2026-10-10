import Link from "next/link";

import MobileLogoutButton from "@/components/mobile-admin/MobileLogoutButton";
import PushNotificationSettings from "@/components/mobile-admin/PushNotificationSettings";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  super_admin: "Direction",
  admin: "Administration",
  manager: "Management",
  artistic_director: "Direction artistique",
};

export default async function MobileProfilePage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nom, full_name, email, role, poste, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.nom || profile?.full_name || "Membre LMG";
  const email = user.email || profile?.email || "E-mail non renseigné";
  const avatar = profile?.avatar_url || user.user_metadata?.avatar_url || "";
  const role = roleLabels[profile?.role || ""] || "Équipe LMG";

  return (
    <div className="px-5 py-6">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">Mon compte</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Profil</h1>
      </header>

      <section className="mt-6 overflow-hidden rounded-[26px] border border-[#f2b705]/20 bg-[#11100b] p-6 text-center">
        <Avatar name={name} url={avatar} />
        <h2 className="mt-4 text-2xl font-black">{name}</h2>
        <p className="mt-1 text-sm text-zinc-500">{profile?.poste || role}</p>
        <span className="mt-4 inline-flex rounded-full border border-[#f2b705]/20 bg-[#f2b705]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#f2b705]">{role}</span>
      </section>

      <section className="mt-6 rounded-[22px] border border-white/[0.07] bg-white/[0.02] px-4">
        <Info label="E-mail professionnel" value={email} />
        <Info label="Membre depuis" value={profile?.created_at ? new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(profile.created_at)) : "Non renseigné"} />
      </section>

      <section className="mt-7">
        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#f2b705]">Réglages</p>
        <div className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.02] px-4">
          <PushNotificationSettings />
          <Setting href="/mobile/alertes" title="Notifications" detail="Consulter tes alertes LMG" />
          <Setting title="Sécurité" detail="Disponible prochainement dans l’application" />
          <Setting title="Modifier le profil" detail="Disponible prochainement dans l’application" last />
        </div>
      </section>

      <div className="mt-7"><MobileLogoutButton /></div>
      <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-800">LMG Admin · accès sécurisé</p>
    </div>
  );
}

function Avatar({ name, url }: { name: string; url: string }) {
  const initials = name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-[26px] border border-white/10 bg-black text-2xl font-black text-[#f2b705]" style={url ? { backgroundImage: `url(${url})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>{url ? <span className="sr-only">Photo de {name}</span> : initials}</div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-white/[0.06] py-4 last:border-0"><p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-700">{label}</p><p className="mt-1.5 break-words text-sm font-bold text-zinc-300">{value}</p></div>;
}

function Setting({ href, title, detail, last = false }: { href?: string; title: string; detail: string; last?: boolean }) {
  const content = <><div className="min-w-0 flex-1"><p className="text-sm font-black">{title}</p><p className="mt-1 text-xs text-zinc-600">{detail}</p></div>{href && <span className="text-zinc-700">›</span>}</>;
  const className = `flex items-center gap-3 py-4 ${last ? "" : "border-b border-white/[0.06]"}`;
  return href ? <Link href={href} className={className}>{content}</Link> : <div className={className}>{content}</div>;
}
