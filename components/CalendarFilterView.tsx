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

export default function CalendarFilterView({
  days,
  events,
}: {
  days: { key: string; day: string; isToday: boolean }[];
  events: CalendarEvent[];
}) {
  const categories = ["Sortie", "Rollout", "Contrat", "Booking", "Relance", "Tâche"];
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
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              activeCategories.includes(category)
                ? "border-white bg-white text-black"
                : "border-zinc-700 bg-black text-zinc-400"
            }`}
          >
            {category}
          </button>
        ))}
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