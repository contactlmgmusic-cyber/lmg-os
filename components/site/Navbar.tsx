"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useSiteLanguage();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const header = useRef<HTMLElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);

  const sections = [
    {
      id: "about",
      label: t.navigation.about,
      path: "/site/about",
      title: t.about.title,
      intro: t.about.intro,
      links: [
        [
          "/site/about",
          t.about.overview,
          t.about.overviewDescription,
        ],
        [
          "/site/about/what-we-do",
          t.about.whatWeDo,
          t.about.whatWeDoDescription,
        ],
        [
          "/site/about/live",
          t.about.live,
          t.about.liveDescription,
        ],
        [
          "/site/team",
          t.about.team,
          t.about.teamDescription,
        ],
        [
          "/site/contact",
          t.about.contact,
          t.about.contactDescription,
        ],
      ],
    },
    {
      id: "artists",
      label: t.navigation.artists,
      path: "/site/artistes",
      title: t.artists.title,
      intro: t.artists.intro,
      links: [
        [
          "/site/artistes",
          t.artists.roster,
          t.artists.rosterDescription,
        ],
        [
          "/site/releases",
          t.artists.releases,
          t.artists.releasesDescription,
        ],
        [
          "/site/artist-portal",
          t.artists.portal,
          t.artists.portalDescription,
        ],
      ],
    },
    {
      id: "news",
      label: t.navigation.news,
      path: "/site/news",
      title: t.news.title,
      intro: t.news.intro,
      links: [
        [
          "/site/news",
          t.news.musicNews,
          t.news.musicNewsDescription,
        ],
        [
          "/site/press",
          t.news.press,
          t.news.pressDescription,
        ],
      ],
    },
  ] as const;

  const closeAll = () => {
    setExpanded(null);
    setMobileOpen(false);
  };

  const active = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const toggleSection = (
    id: string,
    target: HTMLButtonElement
  ) => {
    lastTrigger.current = target;
    setExpanded((current) => (current === id ? null : id));
  };

  const closePanel = () => {
    setExpanded(null);
    lastTrigger.current?.focus();
  };

  const changeLanguage = (language: "en" | "fr") => {
    setLocale(language);
    setExpanded(null);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (expanded) {
        setExpanded(null);
        lastTrigger.current?.focus();
        return;
      }

      if (mobileOpen) {
        setMobileOpen(false);
        mobileToggle.current?.focus();
      }
    };

    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) {
        setExpanded(null);
        setMobileOpen(false);
      }
    };

    const focusOutside = (event: FocusEvent) => {
      if (!header.current?.contains(event.target as Node)) {
        setExpanded(null);
        setMobileOpen(false);
      }
    };

    const breakpoint = window.matchMedia("(max-width: 800px)");

    const resize = () => {
      setExpanded(null);
      setMobileOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", focusOutside);
    breakpoint.addEventListener("change", resize);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", focusOutside);
      breakpoint.removeEventListener("change", resize);
    };
  }, [expanded, mobileOpen]);

  return (
    <header ref={header} className="music-site-header">
      <Link
        href="/site"
        className="music-brand"
        aria-label="LMG Music, Home"
        onClick={closeAll}
      >
        <Image
          src="/logo-lmg-v2.png"
          alt="LMG Music"
          width={64}
          height={64}
          priority
          className="music-logo"
        />
      </Link>

      <nav
        className="music-desktop-nav"
        aria-label={
          locale === "en"
            ? "Main navigation"
            : "Navigation principale"
        }
      >
        {sections.map((section) => (
          <div className="music-nav-section" key={section.id}>
            <button
              type="button"
              className={`music-nav-trigger${
                active(section.path) ? " is-current" : ""
              }`}
              aria-expanded={expanded === section.id}
              aria-controls={`desktop-${section.id}`}
              onClick={(event) =>
                toggleSection(section.id, event.currentTarget)
              }
            >
              {section.label}

              <span aria-hidden="true">
                {expanded === section.id ? "−" : "+"}
              </span>
            </button>

            <div
              id={`desktop-${section.id}`}
              className="music-mega-panel"
              hidden={expanded !== section.id}
            >
              <button
                type="button"
                className="music-panel-close"
                aria-label={
                  locale === "en"
                    ? "Close submenu"
                    : "Fermer le sous-menu"
                }
                onClick={closePanel}
              >
                ×
              </button>

              <div className="music-mega-intro">
                <span>LMG MUSIC</span>
                <h2>{section.title}</h2>
                <p>{section.intro}</p>
              </div>

              <ul className="music-mega-links">
                {section.links.map(
                  ([href, label, description]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={
                          pathname === href ? "page" : undefined
                        }
                        onClick={closeAll}
                      >
                        <span>
                          <strong>{label}</strong>
                          <small>{description}</small>
                        </span>

                        <span aria-hidden="true">↗</span>
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        ))}

        <a
          href="https://careers.lmgmusic.fr"
          className="music-nav-trigger"
        >
          {t.navigation.careers}
        </a>

        <Link
          href="/site/faq"
          className={`music-nav-trigger${
            active("/site/faq") ? " is-current" : ""
          }`}
          aria-current={
            pathname === "/site/faq" ? "page" : undefined
          }
          onClick={closeAll}
        >
          {t.navigation.faq}
        </Link>
      </nav>

      <div
        className="music-language-switcher"
        aria-label={locale === "en" ? "Language" : "Langue"}
      >
        <button
          type="button"
          className={locale === "en" ? "is-active" : ""}
          aria-pressed={locale === "en"}
          onClick={() => changeLanguage("en")}
        >
          EN
        </button>

        <span aria-hidden="true">/</span>

        <button
          type="button"
          className={locale === "fr" ? "is-active" : ""}
          aria-pressed={locale === "fr"}
          onClick={() => changeLanguage("fr")}
        >
          FR
        </button>
      </div>

      <Link
        href="/site/recherche"
        className="music-header-search"
        aria-label={t.navigation.search}
        onClick={closeAll}
      >
        <span className="music-search-icon" aria-hidden="true" />
      </Link>

      <button
        ref={mobileToggle}
        type="button"
        className="music-menu-toggle"
        aria-expanded={mobileOpen}
        aria-controls="music-mobile-menu"
        onClick={() => {
          setMobileOpen((current) => !current);
          setExpanded(null);
        }}
      >
        {mobileOpen
          ? t.navigation.close
          : t.navigation.menu}

        <span aria-hidden="true">
          {mobileOpen ? "−" : "+"}
        </span>
      </button>

      <nav
        id="music-mobile-menu"
        className="music-mobile-menu"
        aria-label={
          locale === "en"
            ? "Mobile navigation"
            : "Navigation mobile"
        }
        hidden={!mobileOpen}
      >
        {sections.map((section, index) => (
          <div className="music-mobile-section" key={section.id}>
            <button
              type="button"
              className={`music-mobile-section-trigger${
                active(section.path) ? " is-current" : ""
              }`}
              aria-expanded={expanded === section.id}
              aria-controls={`mobile-${section.id}`}
              onClick={(event) =>
                toggleSection(section.id, event.currentTarget)
              }
            >
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>

              {section.label}

              <span aria-hidden="true">
                {expanded === section.id ? "−" : "+"}
              </span>
            </button>

            <ul
              id={`mobile-${section.id}`}
              className="music-mobile-submenu"
              hidden={expanded !== section.id}
            >
              {section.links.map(
                ([href, label, description]) => (
                  <li key={href}>
                    <Link href={href} onClick={closeAll}>
                      <span>
                        <strong>{label}</strong>
                        <small>{description}</small>
                      </span>

                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}

        <a
          href="https://careers.lmgmusic.fr"
          className="music-mobile-direct-link"
          onClick={closeAll}
        >
          <span>04</span>
          {t.navigation.careers}
          <span aria-hidden="true">↗</span>
        </a>

        <Link
          href="/site/faq"
          className="music-mobile-direct-link"
          onClick={closeAll}
        >
          <span>05</span>
          {t.navigation.faq}
          <span aria-hidden="true">↗</span>
        </Link>

        <p>{t.tagline}</p>
      </nav>
    </header>
  );
}
