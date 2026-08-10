"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

const roleLabels: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Administrateur",
  [ROLES.MANAGER]: "Manager",
  [ROLES.ARTISTIC_DIRECTOR]: "Direction artistique",
  [ROLES.ARTISTE]: "Artiste",
  [ROLES.PRESTATAIRE]: "Prestataire",
};

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile, error } =
        await supabaseBrowser
          .from("profiles")
          .select("id, nom, role")
          .eq("id", user.id)
          .single();

      if (error || !profile) {
        setErrorMessage(
          "Impossible de charger le profil."
        );
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setNom(profile.nom || "");
      setEmail(user.email || "");
      setRole(profile.role || "");
      setLoading(false);
    }

    loadProfile();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!userId) return;

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const cleanName = nom.trim();

    if (!cleanName) {
      setErrorMessage(
        "Le nom ne peut pas être vide."
      );
      setSaving(false);
      return;
    }

    const { error } = await supabaseBrowser
      .from("profiles")
      .update({
        nom: cleanName,
      })
      .eq("id", userId);

    if (error) {
      setErrorMessage(
        "Impossible d’enregistrer les modifications."
      );
      setSaving(false);
      return;
    }

    setNom(cleanName);
    setMessage("Profil mis à jour avec succès.");
    setSaving(false);
  }

  const userInitials =
    nom
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "LM";

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-zinc-500">
          Chargement du profil...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Mon compte
        </p>

        <h1 className="mt-3 text-5xl font-black">
          Mon profil
        </h1>

        <p className="mt-3 text-zinc-400">
          Consulte et modifie les informations de ton compte LMG OS.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[340px_1fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-black text-black">
            {userInitials}
          </div>

          <h2 className="mt-6 text-2xl font-bold">
            {nom || "Utilisateur"}
          </h2>

          <p className="mt-2 break-all text-sm text-zinc-500">
            {email}
          </p>

          <span className="mt-5 inline-flex rounded-full border border-zinc-700 bg-black px-4 py-2 text-sm text-zinc-300">
            {roleLabels[role] || role}
          </span>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-3xl font-bold">
            Informations personnelles
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            <div>
              <label
                htmlFor="nom"
                className="mb-2 block text-sm text-zinc-400"
              >
                Nom affiché
              </label>

              <input
                id="nom"
                value={nom}
                onChange={(event) =>
                  setNom(event.target.value)
                }
                className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none transition focus:border-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm text-zinc-400"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                value={email}
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-zinc-500"
              />

              <p className="mt-2 text-xs text-zinc-600">
                L’adresse e-mail ne peut pas être modifiée depuis cette page.
              </p>
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm text-zinc-400"
              >
                Rôle
              </label>

              <input
                id="role"
                value={roleLabels[role] || role}
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-zinc-500"
              />
            </div>

            {message && (
              <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
                {message}
              </p>
            )}

            {errorMessage && (
              <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-white px-6 py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}