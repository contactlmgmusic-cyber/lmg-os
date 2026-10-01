"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  defaultSiteLocale,
  getSiteTranslations,
  SiteLocale,
} from "@/lib/site-i18n";

type LanguageContextValue = {
  locale: SiteLocale;
  setLocale: (locale: SiteLocale) => void;
  t: ReturnType<typeof getSiteTranslations>;
};

const LanguageContext =
  createContext<LanguageContextValue | null>(null);

export function SiteLanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [locale, setLocaleState] =
    useState<SiteLocale>(defaultSiteLocale);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(
      "lmg-music-locale"
    );

    if (savedLocale === "fr" || savedLocale === "en") {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: SiteLocale) => {
    setLocaleState(newLocale);

    window.localStorage.setItem(
      "lmg-music-locale",
      newLocale
    );

    document.documentElement.lang = newLocale;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t: getSiteTranslations(locale),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useSiteLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useSiteLanguage must be used inside SiteLanguageProvider"
    );
  }

  return context;
}
