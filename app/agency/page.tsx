import Image from "next/image";

const expertises = [
  {
    number: "01",
    title: "Identité de marque",
    text: "Positionnement, logo, univers visuel et direction artistique.",
  },
  {
    number: "02",
    title: "Communication",
    text: "Stratégie, réseaux sociaux et prises de parole cohérentes.",
  },
  {
    number: "03",
    title: "Création de contenu",
    text: "Photo, vidéo, montage et formats pensés pour chaque canal.",
  },
  {
    number: "04",
    title: "Sites & digital",
    text: "Sites vitrines, landing pages et expériences digitales utiles.",
  },
  {
    number: "05",
    title: "Marketing",
    text: "Lancements, campagnes, influence et développement commercial.",
  },
];

const offres = [
  ["Identité Essentielle", "Dès 690 € HT"],
  ["Identité Signature", "Dès 1 490 € HT"],
  ["Site Essentiel", "Dès 1 890 € HT"],
  ["Lancement 360", "Dès 2 990 € HT"],
  ["Social Essentiel", "Dès 590 € HT/mois"],
  ["Social Growth", "Dès 990 € HT/mois"],
];

export default function AgencyPage() {
  return (
    <main>
      <header className="agency-nav">
        <a className="agency-logo" href="#accueil">
          <strong>LMG</strong>
          <span>AGENCY</span>
        </a>

        <nav>
          <a href="#agence">L’agence</a>
          <a href="#expertises">Expertises</a>
          <a href="#methode">Notre méthode</a>
          <a href="#offres">Offres</a>
        </nav>

        <a className="agency-button agency-button-small" href="#contact">
          Parler de votre projet
        </a>
      </header>

      <section className="agency-hero" id="accueil">
        <div className="agency-orbit agency-orbit-one" />
        <div className="agency-orbit agency-orbit-two" />

        <div className="agency-hero-content">
          <p className="agency-eyebrow">
            <span />
            Creative & Digital Agency
          </p>

          <h1>
            Votre vision mérite
            <br />
            d’être <em>remarquée.</em>
          </h1>

          <p className="agency-hero-text">
            Nous accompagnons les marques, les entreprises, les entrepreneurs
            et les talents dans la création de leur identité, de leur
            communication et de leur présence digitale.
          </p>

          <div className="agency-actions">
            <a className="agency-button" href="#contact">
              Parler de votre projet <span>↗</span>
            </a>

            <a className="agency-text-link" href="#agence">
              Découvrir l’agence <span>↓</span>
            </a>
          </div>
        </div>

        <div className="agency-stamp">
          <small>STRATEGY · CREATIVE · DIGITAL</small>
          <strong>LMG</strong>
        </div>

        <p className="agency-location">
          PARIS · LILLE
          <br />
          FRANCE
        </p>
      </section>

      <section className="agency-introduction" id="agence">
        <p className="agency-kicker">Notre approche</p>

        <h2>
          Des idées fortes.
          <br />
          Une image cohérente.
          <br />
          <span>Des résultats concrets.</span>
        </h2>

        <div className="agency-introduction-text">
          <strong>
            LMG Agency réunit stratégie, création et digital pour transformer
            vos idées en projets visibles, crédibles et mémorables.
          </strong>

          <p>
            De l’identité de marque au site internet, nous construisons des
            solutions adaptées à vos objectifs — jamais des recettes toutes
            faites.
          </p>
        </div>
      </section>

      <section className="agency-expertises" id="expertises">
        <div className="agency-section-heading">
          <div>
            <p className="agency-kicker agency-yellow">Nos expertises</p>

            <h2>
              Tout ce qu’il faut
              <br />
              pour <em>faire la différence.</em>
            </h2>
          </div>

          <p>
            Une approche globale, pensée pour donner de la cohérence et de
            l’impact à chaque point de contact.
          </p>
        </div>

        <div className="agency-expertise-list">
          {expertises.map((expertise) => (
            <article key={expertise.number}>
              <span>{expertise.number}</span>
              <h3>{expertise.title}</h3>
              <p>{expertise.text}</p>
              <b>↗</b>
            </article>
          ))}
        </div>
      </section>

      <section className="agency-offers" id="offres">
        <div className="agency-offers-heading">
          <p className="agency-kicker">Nos offres</p>

          <h2>
            Des solutions adaptées
            <br />à chaque <em>ambition.</em>
          </h2>

          <p>
            Des formats clairs pour avancer efficacement. Chaque accompagnement
            reste adapté à la réalité de votre projet.
          </p>
        </div>

        <div className="agency-offer-grid">
          {offres.map(([name, price], index) => (
            <article key={name}>
              <span>0{index + 1}</span>
              <h3>{name}</h3>
              <strong>{price}</strong>
              <a href="#contact">
                Découvrir l’offre <b>↗</b>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="agency-method" id="methode">
        <div>
          <p className="agency-kicker agency-yellow">Notre méthode</p>
          <h2>
            Simple, fluide
            <br />
            et <em>sans détour.</em>
          </h2>
        </div>

        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Échange</h3>
              <p>Nous découvrons votre vision, vos besoins et vos objectifs.</p>
            </div>
          </li>

          <li>
            <span>02</span>
            <div>
              <h3>Stratégie</h3>
              <p>Nous définissons une direction claire et adaptée.</p>
            </div>
          </li>

          <li>
            <span>03</span>
            <div>
              <h3>Création</h3>
              <p>Notre équipe et notre réseau donnent vie au projet.</p>
            </div>
          </li>

          <li>
            <span>04</span>
            <div>
              <h3>Lancement</h3>
              <p>Nous livrons, déployons et vous accompagnons dans la suite.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="agency-team">
        <div className="agency-team-heading">
          <p className="agency-kicker">La direction</p>
          <h2>
            Une vision
            <br />
            portée <em>à deux.</em>
          </h2>
        </div>

        <div className="agency-team-grid">
          <article>
            <div className="agency-portrait agency-joseph">
  <Image
    src="/team/joseph.jpg"
    alt="Joseph Kayaya, Président et Cofondateur de Legacy Music Group"
    fill
    sizes="(max-width: 800px) 100vw, 50vw"
  />
</div>
            <p>Président & Fondateur</p>
            <h3>Joseph Kayaya</h3>
            <span>Vision stratégique · Développement · Partenariats</span>
          </article>

          <article>
            <div className="agency-portrait agency-yliana">
  <Image
    src="/team/yliana.jpg"
    alt="Yliana Faidherbe, Directrice de LMG Agency"
    fill
    sizes="(max-width: 800px) 100vw, 50vw"
  />
</div>
            <p>Directrice de LMG Agency</p>
            <h3>Yliana Faidherbe</h3>
            <span>Direction opérationnelle · Communication · Image</span>
          </article>
        </div>
      </section>

      <section className="agency-contact" id="contact">
        <p className="agency-kicker agency-yellow">
          Votre projet commence ici
        </p>

        <h2>
          Prêt à donner une nouvelle
          <br />
          dimension à votre <em>projet ?</em>
        </h2>

        <p>
          Parlez-nous de votre vision. Nous reviendrons vers vous avec une
          première orientation adaptée à vos besoins.
        </p>

        <a
          className="agency-button"
          href="mailto:contact@legacymusicgroup.fr?subject=Demande de projet LMG Agency"
        >
          Démarrer mon projet <span>↗</span>
        </a>
      </section>

      <footer className="agency-footer">
        <div>
          <a className="agency-logo" href="#accueil">
            <strong>LMG</strong>
            <span>AGENCY</span>
          </a>

          <p>
            Agence créative et digitale pour les marques, les entreprises, les
            entrepreneurs et les talents.
          </p>
        </div>

        <div>
          <strong>Navigation</strong>
          <a href="#agence">L’agence</a>
          <a href="#expertises">Expertises</a>
          <a href="#methode">Notre méthode</a>
          <a href="#offres">Offres</a>
        </div>

        <div>
          <strong>Contact</strong>
          <a href="mailto:contact@legacymusicgroup.fr">
            contact@legacymusicgroup.fr
          </a>
        </div>

        <small>
          © 2026 Legacy Music Group — Tous droits réservés.
        </small>
      </footer>
    </main>
  );
}