"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navigation = [
  ["01", "Studio", "#studio"],
  ["02", "Projets", "#work"],
  ["03", "Expertises", "#services"],
  ["04", "Contact", "#contact"],
] as const;

const services = [
  {
    number: "01",
    title: "Brand strategy & identity",
    text: "Positionnement, plateforme de marque, naming, identité visuelle et direction artistique.",
    tags: "STRATÉGIE · LOGO · SYSTÈMES VISUELS",
  },
  {
    number: "02",
    title: "Communication & campaigns",
    text: "Stratégie éditoriale, campagnes, réseaux sociaux et prises de parole cohérentes.",
    tags: "ÉDITORIAL · SOCIAL · CAMPAGNES",
  },
  {
    number: "03",
    title: "Content & influence",
    text: "Photo, vidéo, formats sociaux et activations pensées pour les bons canaux.",
    tags: "PRODUCTION · CRÉATEURS · INFLUENCE",
  },
  {
    number: "04",
    title: "Web & digital experiences",
    text: "Sites, interfaces et expériences digitales rapides, utiles et faites pour convertir.",
    tags: "UX/UI · DÉVELOPPEMENT · PERFORMANCE",
  },
] as const;

function AgencyLogo({ light = false }: { light?: boolean }) {
  return (
    <span className="agency-v2-logo-frame">
      <Image
        src={light ? "/agency/logo-light.png" : "/agency/logo-dark.png"}
        alt="LMG Agency"
        width={160}
        height={160}
        priority
      />
    </span>
  );
}

export default function AgencyExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 850);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );

    document
      .querySelectorAll<HTMLElement>(".agency-v2-reveal")
      .forEach((element) => observer.observe(element));

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="agency-v2" id="top">
      <div
        className={`agency-v2-intro ${loaded ? "is-loaded" : ""}`}
        aria-hidden="true"
      >
        <AgencyLogo light />
        <i />
      </div>

      <header className={`agency-v2-topbar ${menuOpen ? "menu-open" : ""}`}>
        <a href="#top" aria-label="Accueil LMG Agency" onClick={closeMenu}>
          <AgencyLogo light={menuOpen} />
        </a>

        <nav aria-label="Navigation principale">
          {navigation.map(([, label, href]) => (
            <a href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>

        <Link className="agency-v2-start" href="/devis">
          Parler de votre projet <b aria-hidden="true">↗</b>
        </Link>

        <button
          className="agency-v2-menu-button"
          type="button"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          aria-controls="agency-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i />
          <i />
        </button>
      </header>

      <aside
        className={`agency-v2-menu-panel ${menuOpen ? "is-open" : ""}`}
        id="agency-mobile-menu"
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Navigation mobile">
          {navigation.map(([number, label, href]) => (
            <a href={href} key={href} onClick={closeMenu}>
              <small>{number}</small>
              {label}
            </a>
          ))}
        </nav>
        <p>PARIS · LILLE · FRANCE</p>
      </aside>

      <section className="agency-v2-hero" aria-labelledby="agency-hero-title">
        <div className="agency-v2-hero-meta">
          <span>CREATIVE & DIGITAL AGENCY</span>
          <span>PARIS · LILLE</span>
          <span>EST. 2026</span>
        </div>
        <h1 id="agency-hero-title">
          <span>WE BUILD BRANDS</span>
          <span>
            THAT <em>MOVE.</em>
          </span>
        </h1>
        <div className="agency-v2-hero-foot">
          <p>
            Stratégie. Identité. Contenu. Digital.
            <br />
            Une direction claire pour des projets qui avancent.
          </p>
          <a href="#studio">
            <span>Explorer</span>
            <b aria-hidden="true">↓</b>
          </a>
        </div>
        <div className="agency-v2-hero-shape" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </section>

      <section className="agency-v2-statement" id="studio">
        <div className="agency-v2-section-code agency-v2-reveal">
          01 — STUDIO
        </div>
        <h2 className="agency-v2-reveal">
          NOUS TRANSFORMONS
          <br />
          LES VISIONS EN <mark>MARQUES</mark>
          <br />
          VISIBLES, CRÉDIBLES
          <br />
          ET MÉMORABLES.
        </h2>
        <div className="agency-v2-statement-bottom agency-v2-reveal">
          <p>
            LMG Agency est un studio créatif et digital. Nous accompagnons les
            marques, les entreprises, les entrepreneurs et les talents de la
            stratégie au lancement.
          </p>
          <p>
            Pas de recette toute faite. Chaque décision part du besoin, sert une
            ambition et construit une image capable de durer.
          </p>
          <a href="#services">Découvrir le studio ↗</a>
        </div>
      </section>

      <section className="agency-v2-work" id="work">
        <header className="agency-v2-work-head agency-v2-reveal">
          <div className="agency-v2-section-code">02 — SELECTED WORK</div>
          <h2>
            DES PROJETS
            <br />
            QUI PRENNENT
            <br />
            <span>POSITION.</span>
          </h2>
          <p>
            Image, discours, expérience : chaque point de contact avance dans la
            même direction.
          </p>
        </header>
        <div className="agency-v2-cases">
          <a className="agency-v2-case agency-v2-case-a" href="#contact">
            <div className="agency-v2-case-visual">
              <span className="agency-v2-case-index">01</span>
              <div className="agency-v2-deepa">
                DEEPA
                <br />
                <small>BE YOURSELF</small>
              </div>
              <p>
                IDENTITY
                <br />
                HAS A
                <br />
                SCENT.
              </p>
            </div>
            <div className="agency-v2-case-info">
              <div>
                <small>IDENTITÉ · E-COMMERCE · CONTENU</small>
                <h3>Deepa Be Yourself</h3>
              </div>
              <b>VOIR LE PROJET ↗</b>
            </div>
          </a>

          <a className="agency-v2-case agency-v2-case-b" href="#contact">
            <div className="agency-v2-case-visual">
              <span className="agency-v2-case-index">02</span>
              <div className="agency-v2-record">
                <i />
              </div>
              <div className="agency-v2-jack">
                DJ
                <br />
                EL JACK
              </div>
              <p>
                AFRO · R&amp;B
                <br />
                AMAPIANO
              </p>
            </div>
            <div className="agency-v2-case-info">
              <div>
                <small>IMAGE · PRESS KIT · DÉVELOPPEMENT</small>
                <h3>DJ El Jack</h3>
              </div>
              <b>VOIR LE PROJET ↗</b>
            </div>
          </a>

          <a className="agency-v2-case agency-v2-case-c" href="#contact">
            <div className="agency-v2-case-visual">
              <p className="agency-v2-big-type">
                YOUR
                <br />
                VISION.
                <br />
                AMPLIFIED.
              </p>
              <div className="agency-v2-axis">
                <i />
                <b>STRATEGY</b>
                <i />
                <b>CREATIVE</b>
                <i />
                <b>DIGITAL</b>
              </div>
            </div>
            <div className="agency-v2-case-info">
              <div>
                <small>ACCOMPAGNEMENT 360</small>
                <h3>Du positionnement au lancement</h3>
              </div>
              <b>DÉCOUVRIR ↗</b>
            </div>
          </a>
        </div>
      </section>

      <section className="agency-v2-services" id="services">
        <header className="agency-v2-services-intro agency-v2-reveal">
          <div className="agency-v2-section-code">03 — EXPERTISES</div>
          <h2>
            ONE STUDIO.
            <br />
            FOUR FORCES.
          </h2>
          <p>
            Une équipe, un réseau et une direction commune pour garantir la
            cohérence du début à la fin.
          </p>
        </header>
        <div className="agency-v2-service-list">
          {services.map((service, index) => {
            const open = activeService === index;
            return (
              <article className={open ? "is-open" : ""} key={service.number}>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`agency-service-${index}`}
                  onClick={() => setActiveService(open ? -1 : index)}
                >
                  <small>{service.number}</small>
                  <h3>{service.title}</h3>
                  <span aria-hidden="true">↗</span>
                </button>
                <div id={`agency-service-${index}`}>
                  <p>{service.text}</p>
                  <b>{service.tags}</b>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="agency-v2-manifesto">
        <div className="agency-v2-manifesto-track" aria-hidden="true">
          <span>
            CLARITY ↗ COHERENCE ↗ IMPACT ↗ CLARITY ↗ COHERENCE ↗ IMPACT ↗
            CLARITY ↗ COHERENCE ↗ IMPACT ↗
          </span>
        </div>
        <div className="agency-v2-manifesto-grid agency-v2-reveal">
          <div className="agency-v2-section-code">04 — NOTRE MANIÈRE</div>
          <h2>
            THINK
            <br />
            CLEAR.
          </h2>
          <h2>
            MAKE
            <br />
            BOLD.
          </h2>
          <h2>
            MOVE
            <br />
            SMART.
          </h2>
          <div className="agency-v2-process">
            <p>
              <span>01</span>Comprendre avant de créer.
            </p>
            <p>
              <span>02</span>Choisir une direction forte.
            </p>
            <p>
              <span>03</span>Construire avec cohérence.
            </p>
            <p>
              <span>04</span>Lancer avec précision.
            </p>
          </div>
        </div>
      </section>

      <section className="agency-v2-about">
        <div className="agency-v2-about-copy agency-v2-reveal">
          <div className="agency-v2-section-code">05 — LMG AGENCY</div>
          <h2>
            CREATIVE
            <br />
            BY CULTURE.
            <br />
            DRIVEN BY
            <br />
            RESULTS.
          </h2>
          <p>
            Une agence contemporaine, accessible et ambitieuse. Nous croisons la
            stratégie, la création et la technologie pour transformer une bonne
            idée en une marque qui compte.
          </p>
        </div>
        <div className="agency-v2-about-image">
          <Image
            src="/team/yliana.jpg"
            alt="Yliana Faidherbe, direction de LMG Agency"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
          />
          <span>PARIS · LILLE · PARTOUT ↗</span>
        </div>
      </section>

      <section className="agency-v2-contact" id="contact">
        <div className="agency-v2-section-code">06 — START A PROJECT</div>
        <h2>
          VOUS AVEZ
          <br />
          LA VISION.
          <br />
          <mark>CRÉONS L’IMPACT.</mark>
        </h2>
        <Link className="agency-v2-contact-button" href="/devis">
          <span>Parlez-nous de votre projet</span>
          <b aria-hidden="true">↗</b>
        </Link>
        <div className="agency-v2-contact-meta">
          <p>CONTACT@LEGACYMUSICGROUP.FR</p>
          <p>PARIS · LILLE · FRANCE</p>
          <p>LMG AGENCY — CREATIVE &amp; DIGITAL</p>
        </div>
      </section>

      <footer className="agency-v2-footer">
        <a href="#top" aria-label="Retour en haut">
          <AgencyLogo />
        </a>
        <p>© 2026 LEGACY MUSIC GROUP</p>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
