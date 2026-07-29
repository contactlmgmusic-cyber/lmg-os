"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AnalyticsPeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const current =
    searchParams.get("period") || "30";


  function changePeriod(period:string) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("period", period);

    router.push(
      `/analytics/dashboard?${params.toString()}`
    );
  }


  const periods = [
    {
      label:"7 jours",
      value:"7"
    },
    {
      label:"30 jours",
      value:"30"
    },
    {
      label:"90 jours",
      value:"90"
    },
    {
      label:"1 an",
      value:"365"
    },
  ];


  return (
    <div className="flex flex-wrap gap-3">

      {periods.map((item)=>(
        <button
          key={item.value}
          onClick={() => changePeriod(item.value)}
          className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
            current === item.value
              ? "bg-white text-black"
              : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          {item.label}
        </button>
      ))}

    </div>
  );
}