"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase-browser";

export default function ModifierMembrePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [role, setRole] = useState("member");

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabaseBrowser
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setNom(data.nom || "");
      setRole(data.role || "member");
      setLoading(false);
    }

    fetchProfile();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser
      .from("profiles")
      .update({
        nom,
        role,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/equipe");
    router.refresh();
  }

  if (loading) {
    return <main className="p-10 text-white">Chargement...</main>;
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Modifier membre</h1>
        <p className="mt-3 text-zinc-400">
          Modifier le nom et le rôle d’un membre LMG.
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="max-w-2xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du membre"
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

        <button className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black">
          Enregistrer
        </button>
      </form>
    </main>
  );
}