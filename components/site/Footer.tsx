import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-black text-white">
            Legacy Music Group
          </h3>

          <p className="mt-4 text-sm text-zinc-400">
            Management • Marketing • Booking • Artist Development
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">
            Navigation
          </h4>

          <div className="space-y-2 text-zinc-400">
            <p>Accueil</p>
            <p>Services</p>
            <p>Artistes</p>
            <p>Contact</p>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">
            Réseaux
          </h4>

          <div className="space-y-2 text-zinc-400">
            <p>Instagram</p>
            <p>TikTok</p>
            <p>YouTube</p>
            <p>Spotify</p>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">
            Contact
          </h4>

          <div className="space-y-2 text-zinc-400">
            <p>contact@legacymusicgroup.fr</p>
            <p>Lille, France</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-zinc-900 pt-8 text-sm text-zinc-500">
        © 2026 Legacy Music Group. Tous droits réservés.
      </div>
    </footer>
  );
}