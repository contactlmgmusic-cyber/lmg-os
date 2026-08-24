import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PROFILS_AUTORISES = [
  "marque_entreprise",
  "tpe_entrepreneur",
  "artiste_createur",
  "association",
  "autre",
];

const SERVICES_AUTORISES = [
  "identite",
  "communication",
  "contenu",
  "site",
  "marketing",
  "accompagnement_360",
  "autre",
];

const BUDGETS_AUTORISES = [
  "moins_700",
  "700_1500",
  "1500_3000",
  "3000_5000",
  "plus_5000",
  "a_definir",
];

function nettoyerTexte(value: unknown, longueurMaximale: number) {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, longueurMaximale);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const nom = nettoyerTexte(body.nom, 150);
    const entreprise = nettoyerTexte(body.entreprise, 150);
    const email = nettoyerTexte(body.email, 254).toLowerCase();
    const telephone = nettoyerTexte(body.telephone, 40);
    const profil = nettoyerTexte(body.profil, 50);
    const service = nettoyerTexte(body.service, 50);
    const offre = nettoyerTexte(body.offre, 80);
    const budget = nettoyerTexte(body.budget, 50);
    const delai = nettoyerTexte(body.delai, 50);
    const source = nettoyerTexte(body.source, 50);
    const message = nettoyerTexte(body.message, 5000);

    const consentement =
      body.consentement === "on" || body.consentement === true;

    if (!nom || !email || !profil || !service || !budget || !message) {
      return NextResponse.json(
        { error: "Veuillez compléter tous les champs obligatoires." },
        { status: 400 }
      );
    }

    const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValide) {
      return NextResponse.json(
        { error: "L’adresse e-mail renseignée n’est pas valide." },
        { status: 400 }
      );
    }

    if (!consentement) {
      return NextResponse.json(
        { error: "Le consentement est obligatoire." },
        { status: 400 }
      );
    }

    if (!PROFILS_AUTORISES.includes(profil)) {
      return NextResponse.json(
        { error: "Le profil sélectionné n’est pas valide." },
        { status: 400 }
      );
    }

    if (!SERVICES_AUTORISES.includes(service)) {
      return NextResponse.json(
        { error: "Le service sélectionné n’est pas valide." },
        { status: 400 }
      );
    }

    if (!BUDGETS_AUTORISES.includes(budget)) {
      return NextResponse.json(
        { error: "Le budget sélectionné n’est pas valide." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Configuration Supabase Agency manquante.");

      return NextResponse.json(
        { error: "Le service est temporairement indisponible." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase.from("agency_leads").insert({
      nom,
      entreprise: entreprise || null,
      email,
      telephone: telephone || null,
      profil,
      service,
      offre: offre || null,
      budget,
      delai: delai || null,
      source: source || null,
      message,
      consentement: true,
      statut: "nouveau",
      priorite: "moyenne",
      origine: "site_agency",
    });

    if (error) {
      console.error("Erreur création prospect Agency :", error);

      return NextResponse.json(
        { error: "La demande n’a pas pu être enregistrée." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Votre demande a bien été envoyée.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur route devis Agency :", error);

    return NextResponse.json(
      { error: "Une erreur inattendue est survenue." },
      { status: 500 }
    );
  }
}