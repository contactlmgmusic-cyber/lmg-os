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

  const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] =
  useState("");

const [passwordSaving, setPasswordSaving] =
  useState(false);

const [passwordMessage, setPasswordMessage] =
  useState("");

const [passwordError, setPasswordError] =
  useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
const [avatarUploading, setAvatarUploading] =
  useState(false);
const [avatarError, setAvatarError] = useState("");

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
      setAvatarUrl(
  user.user_metadata?.avatar_url || ""
);
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

async function handlePasswordSubmit(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setPasswordMessage("");
  setPasswordError("");

  if (newPassword.length < 8) {
    setPasswordError(
      "Le mot de passe doit contenir au moins 8 caractères."
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError(
      "Les deux mots de passe ne correspondent pas."
    );
    return;
  }

  setPasswordSaving(true);

  const { error } =
    await supabaseBrowser.auth.updateUser({
      password: newPassword,
    });

  if (error) {
    setPasswordError(
      "Impossible de modifier le mot de passe."
    );
    setPasswordSaving(false);
    return;
  }

  setNewPassword("");
  setConfirmPassword("");
  setPasswordMessage(
    "Mot de passe modifié avec succès."
  );
  setPasswordSaving(false);
}

async function handleAvatarUpload(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file || !userId) return;

  setAvatarError("");

  if (!file.type.startsWith("image/")) {
    setAvatarError(
      "Le fichier sélectionné doit être une image."
    );
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setAvatarError(
      "La photo ne doit pas dépasser 5 Mo."
    );
    return;
  }

  setAvatarUploading(true);

  const extension =
    file.name.split(".").pop()?.toLowerCase() ||
    "jpg";

  const filePath =
    `${userId}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } =
    await supabaseBrowser.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

  if (uploadError) {
    setAvatarError(
      "Impossible d’envoyer la photo."
    );
    setAvatarUploading(false);
    return;
  }

  const {
    data: { publicUrl },
  } = supabaseBrowser.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const { error: updateError } =
    await supabaseBrowser.auth.updateUser({
      data: {
        avatar_url: publicUrl,
      },
    });

  if (updateError) {
    setAvatarError(
      "La photo a été envoyée, mais le profil n’a pas pu être mis à jour."
    );
    setAvatarUploading(false);
    return;
  }

  setAvatarUrl(publicUrl);
  setAvatarUploading(false);
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
          <div className="relative h-24 w-24 overflow-hidden rounded-full border border-zinc-700 bg-white">
  {avatarUrl ? (
    <img
      src={avatarUrl}
      alt={nom || "Photo de profil"}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-3xl font-black text-black">
      {userInitials}
    </div>
  )}
</div>

<label className="mt-5 inline-flex cursor-pointer rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-sm font-semibold text-white transition hover:border-zinc-500">
  {avatarUploading
    ? "Envoi en cours..."
    : avatarUrl
    ? "Changer la photo"
    : "Ajouter une photo"}

  <input
    type="file"
    accept="image/png,image/jpeg,image/webp"
    disabled={avatarUploading}
    onChange={handleAvatarUpload}
    className="hidden"
  />
</label>

{avatarError && (
  <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
    {avatarError}
  </p>
)}

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
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 xl:col-start-2">
  <h2 className="text-3xl font-bold">
    Sécurité
  </h2>

  <p className="mt-3 text-zinc-400">
    Modifie le mot de passe utilisé pour te connecter à LMG OS.
  </p>

  <form
    onSubmit={handlePasswordSubmit}
    className="mt-8 space-y-6"
  >
    <div>
      <label
        htmlFor="new-password"
        className="mb-2 block text-sm text-zinc-400"
      >
        Nouveau mot de passe
      </label>

      <input
        id="new-password"
        type="password"
        value={newPassword}
        onChange={(event) =>
          setNewPassword(event.target.value)
        }
        autoComplete="new-password"
        placeholder="8 caractères minimum"
        className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none transition focus:border-zinc-500"
      />
    </div>

    <div>
      <label
        htmlFor="confirm-password"
        className="mb-2 block text-sm text-zinc-400"
      >
        Confirmer le mot de passe
      </label>

      <input
        id="confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(event) =>
          setConfirmPassword(event.target.value)
        }
        autoComplete="new-password"
        className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none transition focus:border-zinc-500"
      />
    </div>

    {passwordMessage && (
      <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
        {passwordMessage}
      </p>
    )}

    {passwordError && (
      <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
        {passwordError}
      </p>
    )}

    <button
      type="submit"
      disabled={passwordSaving}
      className="rounded-2xl border border-zinc-700 bg-black px-6 py-4 font-bold text-white transition hover:border-zinc-500 hover:bg-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {passwordSaving
        ? "Modification..."
        : "Modifier le mot de passe"}
    </button>
  </form>
</section>
      </div>
    </main>
  );
}