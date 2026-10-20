import { cookies } from "next/headers";
import type { Metadata } from "next";

export type CareersLocale = "fr" | "en";
export const CAREERS_LOCALE_COOKIE = "lmg-careers-locale";

export async function readCareersLocale(): Promise<CareersLocale> {
  const value = (await cookies()).get(CAREERS_LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "fr";
}

export async function careersPageMetadata(input: {
  titleFr: string; titleEn: string; descriptionFr: string; descriptionEn: string;
  canonical: string; noindex?: boolean;
}): Promise<Metadata> {
  const fr = (await readCareersLocale()) === "fr";
  const title = fr ? input.titleFr : input.titleEn;
  const description = fr ? input.descriptionFr : input.descriptionEn;
  return {
    title, description,
    alternates: { canonical: input.canonical },
    openGraph: { title, description, url: input.canonical },
    twitter: { title, description },
    ...(input.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
