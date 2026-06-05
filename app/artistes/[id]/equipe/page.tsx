"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type MembreEquipe = {
  id: string;
  nom: string;
  role: string;
  photo_url: string | null;
  email: string | null;
  telephone: string | null;
  ordre: number | null;
};

export default function EquipeArtistePage() {
  const params = useParams();
  const router = useRouter();
  const artisteId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [artiste, setArtiste] = useState<any>(null);
  const [membres, setMembres] = useState<MembreEquipe[]>([]);

  const [nom, setNom] = useState("");
  const [role, setRole] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ordre, setOrdre] = useState(0);

  async function loadData() {
    const { data: artisteData } = await supabaseBrowser
      .from("artistes")
      .select("id, nom")
      .eq("id", artisteId)
      .single();

    const { data: equipeData } = await supabaseBrowser
      .from("equipe_artiste")
      .select("*")
      .eq("artiste_id", artisteId)
      .order("ordre", { ascending: true });

    setArtiste(artisteData);
    setMembres(equipeData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (artisteId) {
      loadData();
    }
  }, [artisteId]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];

  if (!file) return;

  setUploading(true);

  const filePath = `equipe-artiste/${artisteId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabaseBrowser.storage
    .from("lmg-assets")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {
    alert(uploadError.message);
    setUploading(false);
    return;
  }

  const { data } = supabaseBrowser.storage
    .from("lmg-assets")
    .getPublicUrl(filePath);

  setPhotoUrl(data.publicUrl);
  setUploading(false);
}

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    if (!nom.trim() || !role.trim()) {
      alert("Le nom et le rôle sont obligatoires.");
      return;
    }

    setSaving(true);

    const { error } = await supabaseBrowser.from("equipe_artiste").insert({
      artiste_id: artisteId,
      nom,
      role,
      photo_url: photoUrl || null,
      email: email || null,
      telephone: telephone || null,
      ordre,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setNom("");
    setRole("");
    setPhotoUrl("");
    setEmail("");
    setTelephone("");
    setOrdre(0);

    await loadData();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce membre de l'équipe ?")) return;

    const { error } = await supabaseBrowser
      .from("equipe_artiste")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <Link
            href={`/artistes/${artisteId}`}
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← Retour artiste
          </Link>

          <h1 className="mt-6 text-5xl font-bold">Équipe artiste</h1>

          <p className="mt-3 text-zinc-400">
            {artiste?.nom || "Artiste"} — gestion de l'équipe proche.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <form
          onSubmit={handleAdd}
          className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
        >
          <h2 className="mb-6 text-3xl font-bold">Ajouter un membre</h2>

          <div className="space-y-4">
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
            />

            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Rôle : Manager, CEO, Photo/Vidéo..."
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
            />

            <div>
  {photoUrl && (
    <img
      src={photoUrl}
      alt="Photo membre"
      className="mb-4 h-24 w-24 rounded-full object-cover"
    />
  )}

  <label className="block cursor-pointer rounded-xl border border-dashed border-zinc-700 bg-black px-4 py-6 text-center text-zinc-400 hover:border-white hover:text-white">
    {uploading ? "Upload de la photo..." : "Importer une photo"}

    <input
      type="file"
      accept="image/*"
      onChange={handlePhotoUpload}
      className="hidden"
    />
  </label>
</div>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
            />

            <input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Téléphone"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
            />

            <input
              type="number"
              value={ordre}
              onChange={(e) => setOrdre(Number(e.target.value))}
              placeholder="Ordre d'affichage"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? "Ajout..." : "Ajouter le membre"}
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Membres actuels</h2>

          {membres.length === 0 && (
            <p className="text-zinc-500">Aucun membre renseigné.</p>
          )}

          <div className="space-y-4">
            {membres.map((membre) => (
              <div
                key={membre.id}
                className="rounded-2xl border border-zinc-800 bg-black p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {membre.photo_url ? (
                      <img
                        src={membre.photo_url}
                        alt={membre.nom}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                        👤
                      </div>
                    )}

                    <div>
                      <h3 className="text-xl font-bold">{membre.nom}</h3>
                      <p className="text-sm text-zinc-400">{membre.role}</p>

                      {membre.email && (
                        <p className="mt-2 text-sm text-zinc-500">
                          {membre.email}
                        </p>
                      )}

                      {membre.telephone && (
                        <p className="text-sm text-zinc-500">
                          {membre.telephone}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(membre.id)}
                    className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}