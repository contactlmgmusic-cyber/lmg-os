"use client";

import { useEffect, useState } from "react";

const items = [
  { id: "overview", label: "Vue d’ensemble" },
  { id: "audience", label: "Audience" },
  { id: "performance", label: "Performance & finance" },
  { id: "operations", label: "Pilotage" },
];

export default function ArtistProfileNav() {
  const [active, setActive] = useState("synthese");

  useEffect(() => {
    const panels = document.querySelectorAll<HTMLElement>("[data-artist-panel]");
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.artistPanel !== active;
    });
    window.history.replaceState(null, "", `#${active}`);
  }, [active]);

  return (
    <nav
      aria-label="Rubriques de la fiche artiste"
      className="sticky top-[72px] z-20 mb-8 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur lg:top-4"
    >
      <div className="grid min-w-[680px] grid-cols-4 gap-2">
        {items.map((item) => {
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(item.id)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                selected
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
