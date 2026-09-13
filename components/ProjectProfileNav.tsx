"use client";

import { useEffect, useState } from "react";

const tabs = [
  { id: "overview", label: "Synthèse" },
  { id: "production", label: "Production" },
  { id: "documents", label: "Documents" },
  { id: "finance", label: "Finances & droits" },
  { id: "diffusion", label: "Diffusion" },
];

export default function ProjectProfileNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-project-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.projectPanel !== active;
    });
    window.history.replaceState(null, "", `#${active}`);
  }, [active]);

  return (
    <nav className="sticky top-[72px] z-20 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur lg:top-4" aria-label="Rubriques du projet">
      <div className="grid min-w-[820px] grid-cols-5 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${active === tab.id ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:bg-zinc-900 hover:text-white"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
