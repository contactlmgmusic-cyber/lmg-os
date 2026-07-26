"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function NouveauParticipantPage() {
  const params = useParams();
  const router = useRouter();

  const splitId = params.id as string;

  const [saving, setSaving] = useState(false);

  const [nom, setNom] = useState("");
  const [role, setRole] = useState("Auteur");
  const [pourcentage, setPourcentage] = useState("");
  const [email, setEmail] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

useEffect(() => {
  async function checkAccess() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabaseBrowser
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== ROLES.SUPER_ADMIN &&
      profile?.role !== ROLES.ADMIN &&
      profile?.role !== ROLES.ARTISTIC_DIRECTOR &&
      profile?.role !== ROLES.MANAGER
    ) {
      router.push("/");
      return;
    }

    setCurrentRole(profile.role);
    setCurrentProfileId(profile.id);

    if (profile.role === ROLES.MANAGER) {
      const { data: managedArtists } = await supabaseBrowser
        .from("artistes")
        .select("id")
        .eq("manager_id", profile.id);

      const artisteIds = (managedArtists || []).map(
        (artiste: any) => artiste.id
      );

      const { data: split } = await supabaseBrowser
        .from("splits")
        .select("artiste_id")
        .eq("id", splitId)
        .single();

      if (!split || !artisteIds.includes(split.artiste_id)) {
        router.push("/splits");
      }
    }
  }

  checkAccess();
}, [router, splitId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    if (!currentRole || !currentProfileId) {
  alert("Impossible de vérifier tes permissions.");
  setSaving(false);
  return;
}

if (currentRole === ROLES.MANAGER) {
  const { data: managedArtists } = await supabaseBrowser
    .from("artistes")
    .select("id")
    .eq("manager_id", currentProfileId);

  const artisteIds = (managedArtists || []).map(
    (artiste: any) => artiste.id
  );

  const { data: split } = await supabaseBrowser
    .from("splits")
    .select("artiste_id")
    .eq("id", splitId)
    .single();

  if (!split || !artisteIds.includes(split.artiste_id)) {
    alert("Tu n'as pas accès à ce split.");
    setSaving(false);
    return;
  }
}

const { data: participants } = await supabaseBrowser
  .from("split_participants")
  .select("pourcentage")
  .eq("split_id", splitId);

const totalActuel =
  (participants || []).reduce(
    (sum: number, p: any) => sum + Number(p.pourcentage || 0),
    0
  ) + Number(pourcentage);

if (totalActuel > 100) {
  alert(
    `Le total dépasserait 100 % (${totalActuel.toFixed(2)} %).`
  );
  setSaving(false);
  return;
}

    const { error } = await supabaseBrowser
      .from("split_participants")
      .insert({
        split_id: splitId,
        nom,
        role,
        pourcentage: Number(pourcentage),
        email,
      });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/splits/${splitId}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Royalties
        </p>

        <h1 className="text-5xl font-bold">
          Ajouter un participant
        </h1>

        <p className="mt-3 text-zinc-400">
          Auteur, compositeur, producteur ou beatmaker.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du participant"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option>Auteur</option>
          <option>Compositeur</option>
          <option>Producteur</option>
          <option>Beatmaker</option>
          <option>Interprète</option>
        </select>

        <input
          required
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={pourcentage}
          onChange={(e) => setPourcentage(e.target.value)}
          placeholder="% de répartition"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optionnel)"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Ajouter participant"}
        </button>
      </form>
    </main>
  );
}