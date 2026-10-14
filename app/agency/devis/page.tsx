"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function DevisAgencyPage() {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/agency/devis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("La demande n’a pas pu être envoyée.");
      }

      form.reset();
      setSuccess(true);
    } catch {
      setError(
        "Une erreur est survenue. Vous pouvez nous écrire directement à contact@legacymusicgroup.fr."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="agency-quote-page">
      <header className="agency-quote-header">
        <Link href="/" className="agency-quote-logo">
          <img src="/logo-lmg.png" alt="Legacy Music Group" />
          <span>AGENCY</span>
        </Link>

        <Link href="/" className="agency-quote-back">
          ← Retour au site
        </Link>
      </header>

      <section className="agency-quote-hero">
        <div>
          <span className="agency-kicker">PARLONS DE VOTRE PROJET</span>

          <h1>
            Une idée, un besoin,
            <br />
            <em>un objectif ?</em>
          </h1>

          <p>
            Présentez-nous votre projet. Notre équipe reviendra vers vous avec
            une première orientation et une proposition adaptée.
          </p>
        </div>

        <div className="agency-quote-reassurance">
          <span>01</span>
          <p>Réponse personnalisée</p>

          <span>02</span>
          <p>Proposition adaptée à vos objectifs</p>

          <span>03</span>
          <p>Premier échange sans engagement</p>
        </div>
      </section>

      <section className="agency-quote-content">
        {success ? (
          <div className="agency-quote-success">
            <span>DEMANDE ENVOYÉE</span>
            <h2>Merci pour votre confiance.</h2>

            <p>
              Votre demande a bien été transmise à LMG Agency. Notre équipe
              reviendra vers vous rapidement.
            </p>

            <Link href="/">Retourner à l’accueil</Link>
          </div>
        ) : (
          <form className="agency-quote-form" onSubmit={handleSubmit}>
            <div className="agency-form-heading">
              <span>VOTRE DEMANDE</span>
              <h2>Parlez-nous de votre projet</h2>
            </div>

            <div className="agency-form-grid">
              <label>
                Prénom et nom *
                <input
                  type="text"
                  name="nom"
                  placeholder="Votre prénom et votre nom"
                  required
                />
              </label>

              <label>
                Entreprise ou projet
                <input
                  type="text"
                  name="entreprise"
                  placeholder="Nom de votre structure"
                />
              </label>

              <label>
                Adresse e-mail *
                <input
                  type="email"
                  name="email"
                  placeholder="vous@entreprise.fr"
                  required
                />
              </label>

              <label>
                Téléphone
                <input
                  type="tel"
                  name="telephone"
                  placeholder="+33 6 00 00 00 00"
                />
              </label>

              <label>
                Vous êtes *
                <select name="profil" defaultValue="" required>
                  <option value="" disabled>
                    Sélectionnez votre profil
                  </option>
                  <option value="marque_entreprise">
                    Une marque ou une entreprise
                  </option>
                  <option value="tpe_entrepreneur">
                    Une TPE ou un entrepreneur
                  </option>
                  <option value="artiste_createur">
                    Un artiste ou un créateur
                  </option>
                  <option value="association">Une association</option>
                  <option value="autre">Autre</option>
                </select>
              </label>

              <label>
                Service recherché *
                <select name="service" defaultValue="" required>
                  <option value="" disabled>
                    Sélectionnez un service
                  </option>
                  <option value="identite">
                    Identité de marque et direction artistique
                  </option>
                  <option value="communication">
                    Communication et réseaux sociaux
                  </option>
                  <option value="contenu">Création de contenu</option>
                  <option value="site">Site internet et digital</option>
                  <option value="marketing">
                    Marketing et développement
                  </option>
                  <option value="accompagnement_360">
                    Accompagnement global 360°
                  </option>
                  <option value="autre">Autre besoin</option>
                </select>
              </label>

              <label>
                Offre envisagée
                <select name="offre" defaultValue="">
                  <option value="">Je ne sais pas encore</option>
                  <option value="identite_essentielle">
                    Identité Essentielle — dès 690 € HT
                  </option>
                  <option value="identite_signature">
                    Identité Signature — dès 1 490 € HT
                  </option>
                  <option value="site_essentiel">
                    Site Essentiel — dès 1 890 € HT
                  </option>
                  <option value="lancement_360">
                    Lancement 360 — dès 2 990 € HT
                  </option>
                  <option value="journee_contenu">
                    Journée Contenu — dès 790 € HT
                  </option>
                  <option value="lancement_artiste">
                    Lancement Artiste — dès 1 490 € HT
                  </option>
                  <option value="social_essentiel">
                    Social Essentiel — 590 € HT/mois
                  </option>
                  <option value="social_growth">
                    Social Growth — 990 € HT/mois
                  </option>
                  <option value="direction_360">
                    Direction 360 — dès 1 690 € HT/mois
                  </option>
                  <option value="sur_mesure">Projet sur mesure</option>
                </select>
              </label>

              <label>
                Budget estimé *
                <select name="budget" defaultValue="" required>
                  <option value="" disabled>
                    Sélectionnez une fourchette
                  </option>
                  <option value="moins_700">Moins de 700 €</option>
                  <option value="700_1500">De 700 € à 1 500 €</option>
                  <option value="1500_3000">De 1 500 € à 3 000 €</option>
                  <option value="3000_5000">De 3 000 € à 5 000 €</option>
                  <option value="plus_5000">Plus de 5 000 €</option>
                  <option value="a_definir">À définir ensemble</option>
                </select>
              </label>

              <label>
                Délai souhaité
                <select name="delai" defaultValue="">
                  <option value="">À définir ensemble</option>
                  <option value="urgent">Dès que possible</option>
                  <option value="moins_1_mois">Dans moins d’un mois</option>
                  <option value="1_3_mois">Dans 1 à 3 mois</option>
                  <option value="plus_3_mois">Dans plus de 3 mois</option>
                </select>
              </label>

              <label>
                Comment avez-vous connu LMG Agency ?
                <select name="source" defaultValue="">
                  <option value="">Sélectionnez une réponse</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="google">Google</option>
                  <option value="recommandation">Recommandation</option>
                  <option value="legacy_music_group">
                    Legacy Music Group
                  </option>
                  <option value="autre">Autre</option>
                </select>
              </label>
            </div>

            <label className="agency-form-message">
              Présentez-nous votre projet *
              <textarea
                name="message"
                rows={7}
                placeholder="Votre activité, vos objectifs, vos besoins et toute information utile..."
                required
              />
            </label>

            <label className="agency-form-consent">
              <input type="checkbox" name="consentement" required />

              <span>
                J’accepte que LMG Agency utilise ces informations pour répondre
                à ma demande. *
              </span>
            </label>

            {error && <p className="agency-form-error">{error}</p>}

            <button type="submit" disabled={sending}>
              {sending ? "ENVOI EN COURS..." : "ENVOYER MA DEMANDE"}
              <span>↗</span>
            </button>

            <small>
              Les informations transmises restent confidentielles. Un acompte
              de 50 % pourra être demandé après validation du devis.
            </small>
          </form>
        )}
      </section>

      <footer className="agency-quote-footer">
        <p>© 2026 Legacy Music Group — Tous droits réservés.</p>

        <a href="mailto:contact@legacymusicgroup.fr">
          contact@legacymusicgroup.fr
        </a>
      </footer>
    </main>
  );
}