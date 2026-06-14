"use client";

import { useState } from "react";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: string;
  href: string;
  color: string;
  category: string;
};

const categoryStyles: Record<string, string> = {
  Sortie: "border-violet-500/50 bg-violet-500/10 text-violet-200",
  Rollout: "border-cyan-500/50 bg-cyan-500/10 text-cyan-200",
  Contrat: "border-green-500/50 bg-green-500/10 text-green-200",
  Booking: "border-pink-500/50 bg-pink-500/10 text-pink-200",
  Relance: "border-yellow-500/50 bg-yellow-500/10 text-yellow-200",
  Tâche: "border-red-500/50 bg-red-500/10 text-red-200",
  Artiste: "border-blue-500/50 bg-blue-500/10 text-blue-200",
};

export default function CalendarFilterView({
  days,
  events,
}: {
  days: { key: string; day: string; isToday: boolean }[];
  events: CalendarEvent[];
}) {
  const categories = ["Sortie", "Rollout", "Contrat", "Booking", "Relance", "Tâche", "Artiste"];
  const [activeCategories, setActiveCategories] = useState(categories);

  function toggleCategory(category: string) {
    setActiveCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  const filteredEvents = events.filter((event) =>
    activeCategories.includes(event.category)
  );

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((category) => {
          const isActive = activeCategories.includes(category);

          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                isActive
                  ? categoryStyles[category]
                  : "border-zinc-800 bg-black text-zinc-500"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="mb-4 grid grid-cols-7 gap-3 text-center text-sm text-zinc-500">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const dayEvents = filteredEvents.filter(
            (event) => event.date === day.key
          );

          return (
            <div
              key={day.key}
              className={`min-h-40 rounded-3xl border p-4 ${
                day.isToday
                  ? "border-white bg-zinc-900"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-bold">{day.day}</span>

                {dayEvents.length > 0 && (
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-black">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <a
                    key={`${event.type}-${event.id}`}
                    href={event.href}
                    className={`block rounded-xl border px-3 py-2 text-xs transition hover:scale-[1.02] ${event.color}`}
                  >
                    <p className="font-semibold">{event.title}</p>
                    <p className="mt-1 opacity-70">{event.type}</p>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}