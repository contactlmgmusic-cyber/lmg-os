import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-black text-white">
            Legacy Music Group
          </h3>

          <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-500">
            Management artistique, développement, stratégie et création
            d&apos;opportunités autour des artistes et de leurs projets.
          </p>

          <p className="mt-6 text-sm font-semibold text-yellow-500">
            Build Your Legacy.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">
            Navigation
          </h4>

          <div className="space-y-2 text-zinc-400">
            <Link
              href="/site"
              className="block transition hover:text-white"
            >
              Accueil
            </Link>

            <Link
              href="/site/artistes"
              className="block transition hover:text-white"
            >
              Artistes
            </Link>

            <Link
              href="/site/releases"
              className="block transition hover:text-white"
            >
              Releases
            </Link>

            <Link
              href="/site/services"
              className="block transition hover:text-white"
            >
              Services
            </Link>

            <Link
              href="/site/team"
              className="block transition hover:text-white"
            >
              Team
            </Link>

            <Link
              href="/site/rejoindre"
              className="block transition hover:text-white"
            >
              Rejoindre LMG
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">
            Réseaux
          </h4>

          <div className="space-y-2 text-zinc-400">
            <a
              href="https://www.instagram.com/legacymusic.off/"
              target="_blank"
              rel="noopener noreferrer"
              className="block transition hover:text-white"
            >
              Instagram
            </a>

            <a
              href="https://www.tiktok.com/@legacymusic.off/"
              target="_blank"
              rel="noopener noreferrer"
              className="block transition hover:text-white"
            >
              TikTok
            </a>

            <a
              href="https://www.youtube.com/@legacy.musicgroup/"
              target="_blank"
              rel="noopener noreferrer"
              className="block transition hover:text-white"
            >
              YouTube
            </a>
          </div>

          <h4 className="mb-4 mt-8 font-semibold text-white">
            Légal
          </h4>

          <div className="space-y-2 text-zinc-400">
            <Link
              href="/site/mentions-legales"
              className="block transition hover:text-white"
            >
              Mentions légales
            </Link>

            <Link
              href="/site/confidentialite"
              className="block transition hover:text-white"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">
            Contact
          </h4>

          <div className="space-y-3 text-zinc-400">
            <a
              href="mailto:contact@legacymusicgroup.fr"
              className="block transition hover:text-white"
            >
              contact@legacymusicgroup.fr
            </a>

            <p>Paris, France</p>
          </div>

          <Link
            href="/site/rejoindre"
            className="mt-8 inline-block rounded-full border border-zinc-800 px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500"
          >
            Présenter un projet
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col justify-between gap-4 border-t border-zinc-900 pt-8 text-sm text-zinc-600 md:flex-row">
        <p>
          © 2026 Legacy Music Group. Tous droits réservés.
        </p>

        <p>
          Paris · France
        </p>
      </div>
    </footer>
  );
}