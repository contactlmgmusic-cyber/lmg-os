"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type CareersLocale = "en" | "fr";

type CareersLanguageContextValue = {
  locale: CareersLocale;
  setLocale: (locale: CareersLocale) => void;
  toggleLocale: () => void;
};

const CareersLanguageContext =
  createContext<CareersLanguageContextValue | null>(null);

export default function CareersLanguageProvider({
  children,
  initialLocale = "fr",
}: {
  children: React.ReactNode;
  initialLocale?: CareersLocale;
}) {
  const [locale, setLocaleState] =
    useState<CareersLocale>(initialLocale);

  function setLocale(nextLocale: CareersLocale) {
    setLocaleState(nextLocale);
    document.cookie = `lmg-careers-locale=${nextLocale}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    document.documentElement.lang = nextLocale;
  }

  function toggleLocale() {
    setLocale(locale === "en" ? "fr" : "en");
  }

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = { locale, setLocale, toggleLocale };

  return (
    <CareersLanguageContext.Provider value={value}>
      {children}
    </CareersLanguageContext.Provider>
  );
}

export function useCareersLanguage() {
  const context = useContext(
    CareersLanguageContext
  );

  if (!context) {
    throw new Error(
      "useCareersLanguage must be used inside CareersLanguageProvider"
    );
  }

  return context;
}
