"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const periods = [
  { value: "30j", label: "30 derniers jours" },
  { value: "trimestre", label: "Trimestre en cours" },
  { value: "annee", label: "Année en cours" },
  { value: "tout", label: "Tout l’historique" },
] as const;

export default function FinancePeriodNavigation({ period }: { period: string }) {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedPeriod(period);
  }, [period]);

  useEffect(() => {
    periods.forEach(({ value }) => {
      router.prefetch(`/finances/dashboard?periode=${value}`);
    });
  }, [router]);

  function selectPeriod(nextPeriod: string) {
    if (nextPeriod === selectedPeriod) return;
    setSelectedPeriod(nextPeriod);
    startTransition(() => {
      router.replace(`/finances/dashboard?periode=${nextPeriod}`, { scroll: false });
    });
  }

  return (
    <nav
      aria-label="Période financière"
      aria-busy={isPending}
      className="mt-6 flex flex-wrap items-center gap-2"
    >
      {periods.map(({ value, label }) => {
        const active = selectedPeriod === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => selectPeriod(value)}
            className={`rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 ${
              active
                ? "border-yellow-400 bg-yellow-500/10 text-yellow-200"
                : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-600 hover:text-white"
            }`}
          >
            {label}
          </button>
        );
      })}
      <span
        aria-live="polite"
        className={`ml-1 text-xs text-zinc-600 transition-opacity ${isPending ? "opacity-100" : "opacity-0"}`}
      >
        Actualisation…
      </span>
    </nav>
  );
}
