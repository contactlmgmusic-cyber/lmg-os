export type SiteLocale = "en" | "fr";

export const defaultSiteLocale: SiteLocale = "en";

export const siteTranslations = {
  en: {
    navigation: {
      about: "About",
      artists: "Artists",
      news: "News",
      careers: "Careers",
      faq: "FAQ",
      search: "Search",
      menu: "Menu",
      close: "Close",
    },

    about: {
      title: "About LMG Music",
      intro:
        "Discover LMG Music, our vision, our expertise and the people behind the projects.",

      overview: "About LMG Music",
      overviewDescription:
        "Our identity, vision and approach to music.",

      whatWeDo: "What We Do",
      whatWeDoDescription:
        "Artist development, management, production and strategy.",

      live: "Live & Entertainment",
      liveDescription:
        "Booking, showcases, performances and live experiences.",

      team: "Team",
      teamDescription:
        "Meet the people behind LMG Music.",

      contact: "Contact",
      contactDescription:
        "Get in touch with LMG Music.",
    },

    artists: {
      title: "Artists & Music",
      intro:
        "Discover the artists, releases and tools developed within the LMG Music ecosystem.",

      roster: "Our Artists",
      rosterDescription:
        "Discover the artists working with LMG Music.",

      releases: "Releases",
      releasesDescription:
        "Explore music released through the LMG Music ecosystem.",

      portal: "Artist Portal",
      portalDescription:
        "A dedicated workspace designed for LMG Music artists.",
    },

    news: {
      title: "Newsroom",
      intro:
        "Follow the latest news, announcements, releases and stories from LMG Music.",

      musicNews: "LMG Music News",
      musicNewsDescription:
        "Latest news and announcements from LMG Music.",

      press: "Press & Releases",
      pressDescription:
        "Press releases, music releases and media resources.",
    },

        home: {
      releasesEyebrow: "New Music",
      releasesTitle: "Latest Releases",
      releasesAll: "View all releases",

      liveEyebrow: "Live & Entertainment",
      liveTitle: "Beyond the release.",
      liveSubtitle: "From music to live.",
      liveDescription:
        "Live performances, showcases and experiences built around artists and their music.",
      liveCta: "Explore Live & Entertainment",

      newsEyebrow: "Newsroom",
      newsTitle: "Latest News",
      newsAll: "View all news",
      newsEmpty: "New stories coming soon.",

      projectEyebrow: "Work with LMG Music",
      projectTitle: "Have a project?",
      projectDescription:
        "Introduce your music and tell us where you want to take it.",
      projectCta: "Present a project",

      followEyebrow: "Stay Connected",
      followTitle: "Follow LMG Music",
    },

    tagline: "Music. Strategy. Legacy.",
  },

  fr: {
    navigation: {
      about: "À propos",
      artists: "Artistes",
      news: "Actualités",
      careers: "Careers",
      faq: "FAQ",
      search: "Rechercher",
      menu: "Menu",
      close: "Fermer",
    },

    about: {
      title: "À propos de LMG Music",
      intro:
        "Découvrez LMG Music, notre vision, nos expertises et les personnes qui développent nos projets.",

      overview: "À propos de LMG Music",
      overviewDescription:
        "Notre identité, notre vision et notre approche de la musique.",

      whatWeDo: "Nos activités",
      whatWeDoDescription:
        "Développement artistique, management, production et stratégie.",

      live: "Live & Entertainment",
      liveDescription:
        "Booking, showcases, performances et expériences live.",

      team: "L'équipe",
      teamDescription:
        "Découvrez les personnes derrière LMG Music.",

      contact: "Contact",
      contactDescription:
        "Contactez LMG Music.",
    },

    artists: {
      title: "Artistes & Musique",
      intro:
        "Découvrez les artistes, les sorties et les outils développés au sein de l'écosystème LMG Music.",

      roster: "Nos artistes",
      rosterDescription:
        "Découvrez les artistes accompagnés par LMG Music.",

      releases: "Sorties",
      releasesDescription:
        "Découvrez les sorties musicales de l'écosystème LMG Music.",

      portal: "Artist Portal",
      portalDescription:
        "Un espace dédié conçu pour les artistes LMG Music.",
    },

    news: {
      title: "Actualités",
      intro:
        "Suivez les dernières actualités, annonces, sorties et histoires de LMG Music.",

      musicNews: "Actualités LMG Music",
      musicNewsDescription:
        "Les dernières actualités et annonces de LMG Music.",

      press: "Presse & Sorties",
      pressDescription:
        "Communiqués de presse, sorties musicales et ressources médias.",
    },

        home: {
      releasesEyebrow: "Nouveautés",
      releasesTitle: "Dernières sorties",
      releasesAll: "Voir toutes les sorties",

      liveEyebrow: "Live & Entertainment",
      liveTitle: "Au-delà de la sortie.",
      liveSubtitle: "De la musique à la scène.",
      liveDescription:
        "Performances live, showcases et expériences développées autour des artistes et de leur musique.",
      liveCta: "Découvrir Live & Entertainment",

      newsEyebrow: "Newsroom",
      newsTitle: "Dernières actualités",
      newsAll: "Voir toutes les actualités",
      newsEmpty: "De nouvelles actualités arrivent bientôt.",

      projectEyebrow: "LMG Music",
      projectTitle: "Un projet ?",
      projectDescription:
        "Présente-nous ta musique et la direction que tu souhaites lui donner.",
      projectCta: "Présenter un projet",

      followEyebrow: "Stay Connected",
      followTitle: "Suivre LMG Music",
    },

    tagline: "Music. Strategy. Legacy.",
  },
} as const;

export type SiteTranslations =
  (typeof siteTranslations)["en"];

export function getSiteTranslations(
  locale: SiteLocale
): SiteTranslations {
  return siteTranslations[locale] as SiteTranslations;
}
