"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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

const STORAGE_KEY = "lmg-careers-locale";

export default function CareersLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] =
    useState<CareersLocale>("en");

  useEffect(() => {
    const saved =
      window.localStorage.getItem(STORAGE_KEY);

    if (saved === "en" || saved === "fr") {
      setLocaleState(saved);
    }
  }, []);

  function setLocale(nextLocale: CareersLocale) {
    setLocaleState(nextLocale);
    window.localStorage.setItem(
      STORAGE_KEY,
      nextLocale
    );
    document.documentElement.lang = nextLocale;
  }

  function toggleLocale() {
    setLocale(locale === "en" ? "fr" : "en");
  }

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
    }),
    [locale]
  );

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
