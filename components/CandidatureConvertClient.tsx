"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function CandidatureConvertClient({ id }: { id: string }) {
  const router = useRouter();

  const [candidature, setCandidature] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    async function loadCandidature() {
      const { data, error } = await supabaseBrowser
        .from("candidatures")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      setCandidature(data || null);
      setLoading(false);
    }

    loadCandidature();
  }, [id]);

  async function convertToArtist() {
    if (!candidature?.nom_artiste) {
      alert("Nom artiste manquant.");
      return;
    }

    setConverting(true);

    const {
  data: { user },
} = await supabaseBrowser.auth.getUser();

    const { data: existingArtist } = await supabaseBrowser
  .from("artistes")
  .select("id, nom")
  .eq("nom", candidature.nom_artiste)
  .maybeSingle();

if (existingArtist) {
  alert("Cet artiste existe déjà dans le roster.");

  await supabaseBrowser
    .from("candidatures")
    .update({
      statut: "Signé",
    })
    .eq("id", candidature.id);

  router.push(`/artistes/${existingArtist.id}`);
  router.refresh();
  return;
}

    const { data: artiste, error } = await supabaseBrowser
      .from("artistes")
      .insert({
        nom: candidature.nom_artiste,
        instagram: candidature.instagram || "",
        style: candidature.style || "",
        statut: "Signé",
        bio:
          candidature.message ||
          candidature.notes_internes ||
          candidature.note_interne ||
          "",
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setConverting(false);
      return;
    }

    if (!artiste) {
      alert("Erreur lors de la création de l’artiste.");
      setConverting(false);
      return;
    }

    const slug = slugify(artiste.nom);

    await supabaseBrowser.from("chat_channels").insert({
      name: artiste.nom,
      slug: `artiste-${slug}`,
      type: "artiste",
      artiste_id: artiste.id,
    });

    await supabaseBrowser
      .from("candidatures")
      .update({
        statut: "Signé",
      })
      .eq("id", candidature.id);

    const { data: admins } = await supabaseBrowser
      .from("profiles")
      .select("id")
      .in("role", ["super_admin", "admin", "manager"]);

    if (admins && admins.length > 0) {
      await supabaseBrowser.from("notifications").insert(
        admins.map((admin) => ({
          user_id: admin.id,
          type: "artiste",
          titre: "Candidature convertie en artiste",
          description: artiste.nom,
          link: `/artistes/${artiste.id}`,
        }))
      );
    }

const { data: onboardingProject } = await supabaseBrowser
  .from("projets")
  .insert({
    titre: `Onboarding - ${artiste.nom}`,
    type: "Onboarding",
    statut: "En préparation",
    artiste_id: artiste.id,
    notes: "Projet automatique créé lors de la conversion de candidature en artiste.",
  })
  .select()
  .single();

await supabaseBrowser.from("taches").insert([
  {
    titre: `Call découverte - ${artiste.nom}`,
    description: "Organiser un premier échange stratégique avec l’artiste.",
    statut: "À faire",
    priorite: "Haute",
    artiste_id: artiste.id,
    projet_id: onboardingProject?.id || null,
    responsable_id: user?.id || null,
  },
  {
    titre: `Contrat management - ${artiste.nom}`,
    description: "Préparer et envoyer le contrat de collaboration LMG.",
    statut: "À faire",
    priorite: "Haute",
    artiste_id: artiste.id,
    projet_id: onboardingProject?.id || null,
    responsable_id: user?.id || null,
  },
  {
    titre: `Audit catalogue - ${artiste.nom}`,
    description: "Analyser les titres déjà sortis, les masters et les prochaines sorties possibles.",
    statut: "À faire",
    priorite: "Moyenne",
    artiste_id: artiste.id,
    projet_id: onboardingProject?.id || null,
    responsable_id: user?.id || null,
  },
  {
    titre: `Audit réseaux sociaux - ${artiste.nom}`,
    description: "Analyser Instagram, TikTok, YouTube, Spotify et l’identité visuelle.",
    statut: "À faire",
    priorite: "Moyenne",
    artiste_id: artiste.id,
    projet_id: onboardingProject?.id || null,
    responsable_id: user?.id || null,
  },
  {
    titre: `Shooting / contenus - ${artiste.nom}`,
    description: "Prévoir photos, vidéos courtes et contenus de présentation.",
    statut: "À faire",
    priorite: "Moyenne",
    artiste_id: artiste.id,
    projet_id: onboardingProject?.id || null,
    responsable_id: user?.id || null,
  },
  {
    titre: `Stratégie 90 jours - ${artiste.nom}`,
    description: "Définir les objectifs, le positionnement et les premières actions de développement.",
    statut: "À faire",
    priorite: "Haute",
    artiste_id: artiste.id,
    projet_id: onboardingProject?.id || null,
    responsable_id: user?.id || null,
  },
  {
    titre: `Préparer première sortie - ${artiste.nom}`,
    description: "Identifier le premier projet à développer avec LMG.",
    statut: "À faire",
    priorite: "Haute",
    artiste_id: artiste.id,
    projet_id: onboardingProject?.id || null,
    responsable_id: user?.id || null,
  },
]);

    await supabaseBrowser.from("activity_logs").insert({
      type: "Artiste",
      titre: "Candidature convertie",
      description: artiste.nom,
    });

    router.push(`/artistes/${artiste.id}`);
    router.refresh();
  }

  if (loading) {
    return <p className="mt-8 text-zinc-500">Chargement...</p>;
  }

  if (!candidature) {
    return <p className="mt-8 text-red-400">Candidature introuvable.</p>;
  }

  return (
    <div className="mt-8 mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <p className="mb-2 text-sm uppercase tracking-[0.3em] text-yellow-500">
        Conversion artiste
      </p>

      <h1 className="text-5xl font-bold">
        {candidature.nom_artiste || "Artiste"}
      </h1>

      <p className="mt-3 text-zinc-400">
        Cette action va créer l’artiste dans le roster LMG, créer son channel chat,
        notifier l’équipe et passer la candidature en Signé.
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border border-zinc-800 bg-black p-6">
        <p>
          <span className="text-zinc-500">Email :</span>{" "}
          {candidature.email || "Non renseigné"}
        </p>

        <p>
          <span className="text-zinc-500">Instagram :</span>{" "}
          {candidature.instagram || "Non renseigné"}
        </p>

        <p>
          <span className="text-zinc-500">Ville :</span>{" "}
          {candidature.ville || "Non renseignée"}
        </p>
      </div>

      <button
        type="button"
        onClick={convertToArtist}
        disabled={converting}
        className="mt-8 w-full rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-4 text-center font-semibold text-green-300 hover:bg-green-500/20 disabled:opacity-50"
      >
        {converting ? "Conversion..." : "Confirmer la conversion en artiste"}
      </button>
    </div>
  );
}