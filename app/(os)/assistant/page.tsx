import Link from "next/link";

export default function AssistantPage() {
  const outils = [
    {
      titre: "Générer un rollout",
      description:
        "Créer automatiquement un plan de sortie complet.",
      href: "/assistant/rollout",
    },
    {
      titre: "Stratégie TikTok",
      description:
        "Créer un calendrier TikTok adapté à l'artiste.",
      href: "/assistant/tiktok",
    },
    {
      titre: "Bio artiste",
      description:
        "Générer une bio professionnelle.",
      href: "/assistant/bio",
    },
    {
      titre: "Communiqué de presse",
      description:
        "Créer un communiqué prêt à envoyer.",
      href: "/assistant/communique",
    },
    {
      titre: "Pitch booking",
      description:
        "Créer un mail de démarchage pour concerts et festivals.",
      href: "/assistant/booking",
    },
    {
      titre: "Plan de sortie",
      description:
        "Construire la stratégie globale d'un projet.",
      href: "/assistant/sortie",
    },
    {
      titre: "EPK",
      description:
        "Créer un Electronic Press Kit complet.",
      href: "/assistant/epk",
    },
  ];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG AI
        </p>

        <h1 className="text-5xl font-bold">
          Assistant IA
        </h1>

        <p className="mt-3 text-zinc-400">
          Outils IA pour artistes, managers et projets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {outils.map((outil) => (
          <Link
            key={outil.href}
            href={outil.href}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-white"
          >
            <h2 className="text-2xl font-bold">
              {outil.titre}
            </h2>

            <p className="mt-3 text-zinc-400">
              {outil.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}