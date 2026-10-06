const GOLD = "#D4AF5A";

const features = [
  ["01", "Calendrier", "Sessions, rendez-vous, sorties et échéances réunis dans un seul planning."],
  ["02", "Documents", "Tous les documents importants de ton projet accessibles depuis ton espace."],
  ["03", "Validations", "Les éléments qui nécessitent ton retour ou ton approbation, au même endroit."],
  ["04", "Royalties", "Un suivi clair des répartitions et informations financières qui te concernent."],
  ["05", "Événements", "Retrouve les événements, missions et temps forts liés à ton développement."],
  ["06", "Contrats", "Tes contrats et informations administratives disponibles dans ton espace sécurisé."],
];

function MiniHomeScreen() {
  return (
    <div className="flex h-full flex-col bg-[#030303] px-5 pb-5 pt-10 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[7px] font-bold uppercase tracking-[0.28em]"
            style={{ color: GOLD }}
          >
            LMG FOR ARTIST
          </p>
          <h3 className="mt-3 text-[25px] font-bold tracking-[-0.05em]">
            Bonjour, NOVA
          </h3>
          <p className="mt-1 text-[10px] text-zinc-600">
            Voici ce qui compte aujourd&apos;hui.
          </p>
        </div>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-full border text-[10px] font-bold"
          style={{
            borderColor: "rgba(212,175,90,.35)",
            color: GOLD,
            background:
              "radial-gradient(circle at 35% 30%, rgba(212,175,90,.28), rgba(20,20,20,1) 65%)",
          }}
        >
          N
        </div>
      </div>

      <div className="mt-7 rounded-[22px] border border-white/10 bg-[#080808] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[6px] font-bold uppercase tracking-[0.26em]"
              style={{ color: GOLD }}
            >
              À FAIRE MAINTENANT
            </p>
            <p className="mt-2 text-[16px] font-semibold">
              Tes prochaines actions
            </p>
          </div>

          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold"
            style={{
              color: GOLD,
              borderColor: "rgba(212,175,90,.3)",
            }}
          >
            3
          </div>
        </div>

        <div className="mt-4 border-t border-white/10">
          {[
            ["Valider le visuel", "À faire"],
            ["Session studio", "Prévu"],
            ["Réunion projet", "Prévu"],
          ].map(([title, status]) => (
            <div
              key={title}
              className="flex items-center justify-between border-b border-white/10 py-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-white/[0.035]" />
                <div>
                  <p className="text-[9px] font-semibold">{title}</p>
                  <p className="mt-1 text-[7px] text-zinc-600">
                    Projet NOVA
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-white/10 px-2 py-1 text-[6px] text-zinc-500">
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-white/10 bg-[#070707] p-4">
        <p
          className="text-[6px] font-bold uppercase tracking-[0.25em]"
          style={{ color: GOLD }}
        >
          PROCHAINE ÉCHÉANCE
        </p>
        <p className="mt-2 text-[13px] font-semibold">Session studio</p>
        <p className="mt-1 text-[8px] text-zinc-600">Événement · 18 oct.</p>
      </div>

      <div className="mt-6">
        <p
          className="text-[6px] font-bold uppercase tracking-[0.25em]"
          style={{ color: GOLD }}
        >
          APERÇU
        </p>
        <p className="mt-2 text-[16px] font-semibold">Ton activité</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            ["Projets actifs", "2"],
            ["Validations", "3"],
            ["Royalties", "—"],
            ["Contrats", "1"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[14px] border border-white/10 p-3"
            >
              <p className="text-[7px] text-zinc-600">{label}</p>
              <p className="mt-2 text-[15px] font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex justify-around rounded-[18px] border border-white/10 bg-[#080808] px-2 py-3">
        {["⌂", "□", "▤", "○"].map((icon, i) => (
          <span
            key={i}
            className="text-[13px]"
            style={{ color: i === 0 ? GOLD : "#555" }}
          >
            {icon}
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniCalendarScreen() {
  return (
    <div className="h-full bg-[#030303] px-5 pb-5 pt-10 text-white">
      <p
        className="text-[7px] font-bold uppercase tracking-[0.28em]"
        style={{ color: GOLD }}
      >
        LMG FOR ARTIST
      </p>
      <h3 className="mt-3 text-[25px] font-bold tracking-[-0.05em]">
        Calendrier
      </h3>

      <div className="mt-7 rounded-[20px] border border-white/10 bg-[#080808] p-4">
        <p
          className="text-[6px] font-bold uppercase tracking-[0.25em]"
          style={{ color: GOLD }}
        >
          PROCHAINE DATE
        </p>
        <p className="mt-2 text-[15px] font-semibold">Session studio</p>
        <p className="mt-1 text-[8px] text-zinc-600">18 octobre 2026</p>
      </div>

      <div className="mt-5 flex gap-2">
        {["Tout", "Événements", "Sorties"].map((item, i) => (
          <div
            key={item}
            className="rounded-full border px-3 py-2 text-[6px]"
            style={{
              borderColor:
                i === 0 ? "rgba(212,175,90,.45)" : "rgba(255,255,255,.1)",
              color: i === 0 ? GOLD : "#666",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      <p
        className="mt-7 text-[7px] font-bold uppercase tracking-[0.25em]"
        style={{ color: GOLD }}
      >
        OCTOBRE 2026
      </p>

      <div className="mt-3 overflow-hidden rounded-[20px] border border-white/10">
        {[
          ["18", "Session studio", "Studio"],
          ["21", "Réunion projet", "Visio"],
          ["26", "Shooting", "Paris"],
          ["30", "Sortie single", "NOVA"],
        ].map(([date, title, place]) => (
          <div
            key={date}
            className="grid grid-cols-[36px_1fr] gap-3 border-b border-white/10 p-4 last:border-0"
          >
            <strong className="text-[17px]">{date}</strong>
            <div>
              <p
                className="text-[6px] font-bold uppercase tracking-[0.18em]"
                style={{ color: GOLD }}
              >
                ÉVÉNEMENT
              </p>
              <p className="mt-1 text-[10px] font-semibold">{title}</p>
              <p className="mt-1 text-[7px] text-zinc-600">{place}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Phone({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto aspect-[430/880] w-full max-w-[340px] rounded-[3rem] border border-white/15 bg-[#090909] p-[7px]  ${className}`}
    >
      <div className="absolute left-1/2 top-[14px] z-20 h-[20px] w-[82px] -translate-x-1/2 rounded-full bg-black" />
      <div className="h-full overflow-hidden rounded-[2.6rem]">{children}</div>
    </div>
  );
}

export default function ArtistPortalHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030303] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-black/80 ">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 md:px-10">
          <a
            href="https://www.lmgmusic.fr"
            className="flex items-center gap-3"
            aria-label="LMG Music"
          >
            <img
              src="/logo-lmg-v2.png"
              alt="LMG"
              className="h-7 w-auto object-contain"
            />
            <span className="h-4 w-px bg-white/20" />
            <span className="text-[10px] font-semibold tracking-[0.22em] text-zinc-500">
              FOR ARTIST
            </span>
          </a>

          <span
            className="hidden text-[9px] font-bold uppercase tracking-[0.25em] sm:block"
            style={{ color: GOLD }}
          >
            LMG MUSIC
          </span>
        </div>
      </header>

      <section className="relative px-6 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44">
        <div
          className="pointer-events-none absolute right-[-15%] top-[10%] h-[650px] w-[650px] rounded-full "
          style={{ background: "rgba(212,175,90,.08)" }}
        />

        <div className="relative mx-auto grid max-w-[1440px] gap-20 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
          <div className="max-w-[650px]">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.32em]"
              style={{ color: GOLD }}
            >
              LMG MUSIC · ARTIST EXPERIENCE
            </p>

            <h1 className="mt-7 text-[clamp(3.4rem,7vw,6.7rem)] font-bold leading-[0.94] tracking-[-0.065em]">
              Ton projet.
              <br />
              Ton équipe.
              <br />
              <span className="text-zinc-500">Un seul espace.</span>
            </h1>

            <p className="mt-8 max-w-lg text-base leading-7 text-zinc-400 md:text-lg md:leading-8">
              LMG For Artist centralise ce qui compte pour ton développement
              artistique dans une application à télécharger sur ton téléphone.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {[
                ["App Store", "BIENTÔT DISPONIBLE"],
                ["Google Play", "BIENTÔT DISPONIBLE"],
              ].map(([store, status]) => (
                <div
                  key={store}
                  className="min-w-[170px] rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4"
                >
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-zinc-600">
                    {status}
                  </span>
                  <strong className="mt-1 block text-[15px] font-semibold">
                    {store}
                  </strong>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs text-zinc-700">
              Accès réservé aux artistes accompagnés par LMG Music. Les écrans présentés sont des exemples.
            </p>
          </div>

          <div className="relative min-h-[660px] md:min-h-[760px]">
            <div className="absolute left-[4%] top-[11%] hidden w-[280px] -rotate-[8deg] opacity-40 md:block lg:left-[0%] xl:left-[8%]">
              <Phone>
                <MiniCalendarScreen />
              </Phone>
            </div>

            <div className="relative z-10 mx-auto w-[82%] max-w-[350px] rotate-[2deg]">
              <Phone>
                <MiniHomeScreen />
              </Phone>
            </div>

            <div
              className="absolute bottom-[3%] right-[0%] z-20 hidden rounded-2xl border px-5 py-4  md:block xl:right-[5%]"
              style={{
                borderColor: "rgba(212,175,90,.2)",
                background: "rgba(10,10,10,.82)",
              }}
            >
              <p
                className="text-[8px] font-bold uppercase tracking-[0.22em]"
                style={{ color: GOLD }}
              >
                TON ESPACE
              </p>
              <p className="mt-2 text-sm font-semibold">
                Synchronisé avec ton projet LMG
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#060606] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: GOLD }}
              >
                L&apos;APP ARTISTE
              </p>

              <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">
                Pensée pour suivre ton projet au quotidien.
              </h2>
            </div>

            <p className="max-w-lg self-end text-base leading-7 text-zinc-500 lg:justify-self-end">
              Plus besoin de chercher une information entre plusieurs
              conversations ou documents. Ton espace LMG rassemble ton
              activité, tes prochaines dates et les éléments qui nécessitent
              ton attention.
            </p>
          </div>

          <div className="mt-16 grid border-l border-t border-white/[0.08] md:grid-cols-2 lg:grid-cols-3">
            {features.map(([number, title, text]) => (
              <article
                key={number}
                className="min-h-[250px] border-b border-r border-white/[0.08] p-7 md:p-9"
              >
                <span
                  className="text-[9px] font-bold tracking-[0.2em]"
                  style={{ color: GOLD }}
                >
                  {number}
                </span>

                <h3 className="mt-14 text-xl font-semibold">{title}</h3>
                <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1250px] gap-20 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div
              className="absolute inset-20 rounded-full "
              style={{ background: "rgba(212,175,90,.08)" }}
            />
            <Phone className="relative">
              <MiniCalendarScreen />
            </Phone>
          </div>

          <div className="max-w-lg">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD }}
            >
              CALENDRIER
            </p>

            <h2 className="mt-6 text-4xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">
              Garde toujours une longueur d&apos;avance.
            </h2>

            <p className="mt-7 text-base leading-7 text-zinc-500">
              Sessions studio, shootings, rendez-vous, tâches et sorties :
              retrouve les prochaines étapes de ton projet dans un calendrier
              pensé pour ton activité artistique.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#060606] px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1250px] gap-16 lg:grid-cols-2 lg:items-center">
          <div className="max-w-lg lg:order-1">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD }}
            >
              TON SUIVI
            </p>

            <h2 className="mt-6 text-4xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">
              Plus de visibilité sur ce qui compte.
            </h2>

            <p className="mt-7 text-base leading-7 text-zinc-500">
              Validations, contrats, documents et royalties sont intégrés à
              ton espace pour faciliter le suivi entre toi et l&apos;équipe
              LMG.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {["Validations", "Royalties", "Contrats", "Documents"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/[0.08] bg-black px-4 py-5 text-sm text-zinc-400"
                  >
                    <span style={{ color: GOLD }}>◇</span>
                    <span className="ml-3">{item}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="relative lg:order-2">
            <div className="mx-auto w-full max-w-[390px] rounded-[34px] border border-white/10 bg-black p-7 ">
              <p
                className="text-[8px] font-bold uppercase tracking-[0.28em]"
                style={{ color: GOLD }}
              >
                SUIVI FINANCIER
              </p>

              <h3 className="mt-4 text-3xl font-semibold">Mes royalties</h3>

              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Suis les montants qui te concernent et leur état de paiement.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div
                  className="rounded-2xl border p-5"
                  style={{ borderColor: "rgba(212,175,90,.2)" }}
                >
                  <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                    À recevoir
                  </p>
                  <p className="mt-5 text-2xl font-semibold">—</p>
                </div>

                <div className="rounded-2xl border border-white/10 p-5">
                  <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                    Déjà payé
                  </p>
                  <p className="mt-5 text-2xl font-semibold">—</p>
                </div>
              </div>

              <div className="mt-10 border-t border-white/[0.08] pt-8">
                <p
                  className="text-[8px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: GOLD }}
                >
                  HISTORIQUE
                </p>
                <p className="mt-3 text-xl font-semibold">Répartitions</p>

                <div className="mt-12 flex min-h-[150px] items-center justify-center rounded-2xl border border-dashed border-white/[0.08]">
                  <p className="text-xs text-zinc-700">
                    Tes répartitions apparaissent ici.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center md:px-10 md:py-36">
        <div className="mx-auto max-w-3xl">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            PRIVATE BY DESIGN
          </p>

          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
            Ton espace reste ton espace.
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-zinc-500">
            L&apos;accès artiste se fait depuis l&apos;application téléchargeable
            LMG For Artist, réservée aux artistes disposant d&apos;un accès
            actif. Chaque compte est personnel et relié au profil de
            l&apos;artiste concerné.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs text-zinc-600">
            <span>Accès sécurisé</span>
            <span>•</span>
            <span>Compte personnel</span>
            <span>•</span>
            <span>Accès depuis l&apos;application</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-xs text-zinc-700 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/logo-lmg-v2.png"
              alt="LMG"
              className="h-6 w-auto object-contain opacity-70"
            />
            <span>© 2026 LMG Music · LMG For Artist</span>
          </div>

          <a
            href="https://www.lmgmusic.fr"
            className="transition hover:text-white"
          >
            Retour sur LMG Music ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
