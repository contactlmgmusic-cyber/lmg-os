import Link from "next/link";
import InvitationSignupForm from "@/components/InvitationSignupForm";

type SearchParams = Promise<{ invitation?: string | string[] }>;

export default async function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const rawToken = (await searchParams).invitation;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  return <main className="flex min-h-screen items-center justify-center bg-black px-5 py-12 text-white"><section className="w-full max-w-lg rounded-[28px] border border-zinc-800 bg-zinc-950 p-7 md:p-9"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Accès sécurisé LMG</p><h1 className="mt-3 text-4xl font-bold">Rejoindre LMG OS</h1>{!token ? <div className="mt-7"><p className="text-zinc-400">Cette page nécessite un lien d’invitation valide transmis par un administrateur LMG.</p><Link href="/login" className="mt-6 inline-block text-sm font-bold text-yellow-400">Retour à la connexion →</Link></div> : <><p className="mt-3 text-sm leading-6 text-zinc-400">Définis ton accès. Le lien est personnel, temporaire et utilisable une seule fois.</p><InvitationSignupForm token={token} /></>}</section></main>;
}
