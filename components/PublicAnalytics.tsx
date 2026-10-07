"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-WX2YGFMR7B";
type AnalyticsWindow = Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
export default function PublicAnalytics({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = !enabled;
    if (!enabled || !ready) return;
    (window as AnalyticsWindow).gtag?.("event", "page_view", { page_location: location.origin + pathname, page_title: document.title });
  }, [enabled, ready, pathname]);
  if (!enabled || !/^G-[A-Z0-9]+$/.test(GA_ID)) return null;
  return <Script id="lmg-public-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" onReady={() => {
    const w = window as AnalyticsWindow;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function (...args: unknown[]) { w.dataLayer!.push(arguments); };
    w.gtag("js", new Date());
    w.gtag("config", GA_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_domain: location.hostname });
    setReady(true);
  }} />;
}
