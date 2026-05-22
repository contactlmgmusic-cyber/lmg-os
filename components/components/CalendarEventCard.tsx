"use client";

import { useRouter } from "next/navigation";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: string;
  href: string;
  projet: string | null;
};

export default function CalendarEventCard({
  event,
}: {
  event: CalendarEvent;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(event.href)}
      className="grid w-full grid-cols-1 gap-4 rounded-2xl border border-zinc-800 bg-black p-5 text-left transition hover:border-zinc-600 md:grid-cols-[160px_1fr_160px]"
    >
      <div>
        <p className="text-sm text-zinc-500">Date</p>
        <p className="mt-1 font-semibold">{event.date}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold">{event.title}</h2>

        {event.projet && (
          <p className="mt-1 text-sm text-zinc-400">
            Projet : {event.projet}
          </p>
        )}
      </div>

      <div className="flex items-center justify-start md:justify-end">
        <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
          {event.type}
        </span>
      </div>
    </button>
  );
}