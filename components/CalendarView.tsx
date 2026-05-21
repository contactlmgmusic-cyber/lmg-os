"use client";

export default function CalendarView({ events }: { events: any[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white">
      <div className="space-y-4">
        {events.length === 0 && (
          <p className="text-zinc-500">Aucun événement pour le moment.</p>
        )}

        {events.map((event, index) => (
          <div
            key={index}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"
          >
            <h3 className="font-semibold">{event.title}</h3>
            <p className="text-sm text-zinc-400 mt-2">
              {new Date(event.start).toLocaleDateString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}