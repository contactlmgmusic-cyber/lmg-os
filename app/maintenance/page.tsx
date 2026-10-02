import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

async function getMaintenanceContent() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  const supabase = createClient(url, key);

  const { data } = await supabase
    .from("site_settings")
    .select(
      "maintenance_title_fr, maintenance_message_fr, maintenance_title_en, maintenance_message_en"
    )
    .eq("id", "lmg_music")
    .maybeSingle();

  return data;
}

export default async function MaintenancePage() {
  const settings = await getMaintenanceContent();

  const title =
    settings?.maintenance_title_fr ||
    "Site en maintenance";

  const message =
    settings?.maintenance_message_fr ||
    "Nous travaillons actuellement sur LMG Music. Revenez très bientôt.";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(234,179,8,0.08),transparent_35%)]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16rem] font-black tracking-[-0.1em] text-white/[0.015] md:text-[30rem]">
        LMG
      </div>

      <section className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-10 h-px w-12 bg-yellow-500" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-yellow-500">
          LMG Music
        </p>

        <h1 className="mt-6 text-4xl font-medium tracking-[-0.05em] md:text-7xl">
          {title}
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-zinc-400 md:text-lg">
          {message}
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-5">
          <a
            href="/"
            className="rounded-full border border-zinc-800 px-6 py-3 text-sm font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
          >
            Réessayer
          </a>

          <a
            href="https://os.lmgmusic.fr"
            className="px-6 py-3 text-sm font-semibold text-zinc-500 transition hover:text-white"
          >
            LMG OS ↗
          </a>
        </div>

        <p className="mt-14 text-[9px] uppercase tracking-[0.25em] text-zinc-700">
          Build Your Legacy
        </p>
      </section>
    </main>
  );
}
