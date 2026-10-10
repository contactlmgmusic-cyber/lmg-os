import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "LMG Admin",
      short_name: "LMG Admin",
      description: "Le poste de pilotage mobile du staff Legacy Music Group.",
      start_url: "/mobile",
      scope: "/mobile",
      display: "standalone",
      background_color: "#090909",
      theme_color: "#090909",
      orientation: "portrait-primary",
      icons: [
        {
          src: "/logo-lmg-v2.png",
          sizes: "256x256",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/manifest+json",
      },
    }
  );
}
