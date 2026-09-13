"use client";

import { useEffect, useState } from "react";

const items = [
  { href: "#synthese", label: "Synthèse" },
  { href: "#audience", label: "Audience" },
  { href: "#performance", label: "Performance" },
  { href: "#projets-artiste", label: "Projets" },
  { href: "#finance-artiste", label: "Finance" },
  { href: "#business-artiste", label: "Business" },
  { href: "#activite-artiste", label: "Activité" },
];

export default function ArtistProfileNav() {
  const [active, setActive] = useState("synthese");

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((item): item is HTMLElement => Boolean(item));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: [0, 0.25, 0.6] }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Rubriques de la fiche artiste"
      className="sticky top-0 z-20 mb-8 overflow-x-auto border-y border-zinc-900 bg-black/90 py-3 backdrop-blur lg:top-0"
    >
      <div className="flex min-w-max gap-2">
        {items.map((item) => {
          const selected = active === item.href.slice(1);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setActive(item.href.slice(1))}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
