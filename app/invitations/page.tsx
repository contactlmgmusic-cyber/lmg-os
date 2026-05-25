"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const signupLink = "https://TON_URL_VERCEL/signup";

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

export default function InvitationsPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  async function fetchInvitations() {
    const { data } = await supabaseBrowser
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });

    setInvitations(data || []);
  }

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function copyLink() {
    await navigator.clipboard.writeText(signupLink);
    alert("Lien copié !");
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    const { error } = await supabaseBrowser.from("invitations").insert({
      email,
      role,
      invited_by: user?.id || null,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Invitation",
      titre: "Nouvelle invitation créée",
      description: `${email} • ${role}`,
    });

    setEmail("");
    setRole("member");
    await fetchInvitations();
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Invitations
        </p>
        <h1 className="text-5xl font-bold">Inviter un membre</h1>
        <p className="mt-3 text-zinc-400">
          Crée une invitation, copie le lien, puis envoie-le à la personne.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <form
          onSubmit={handleInvite}
          className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
            <option value="artist">Artist</option>
            <option value="guest">Guest</option>
          </select>

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black"
          >
            {loading ? "Création..." : "Créer l’invitation"}
          </button>

          <button
            type="button"
            onClick={copyLink}
            className="w-full rounded-2xl border border-zinc-700 px-5 py-4 font-semibold text-zinc-300 hover:bg-zinc-800"
          >
            Copier le lien d’inscription
          </button>

          <p className="text-sm text-zinc-500">
            La personne doit s’inscrire avec le même email que celui invité.
          </p>
        </form>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-3xl font-bold">Invitations créées</h2>

          <div className="mt-6 space-y-4">
            {invitations.length === 0 && (
              <p className="text-zinc-500">Aucune invitation créée.</p>
            )}

            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="rounded-2xl border border-zinc-800 bg-black p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {invitation.email}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-500">
                      Rôle : {invitation.role}
                    </p>
                  </div>

                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                    {invitation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}