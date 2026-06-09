import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <section className="mx-auto max-w-4xl">
        <Link href="/site" className="text-sm text-zinc-400 hover:text-white">
          ← Retour au site
        </Link>

        <h1 className="mt-10 text-5xl font-black uppercase">
          Mentions légales
        </h1>

        <div className="mt-12 space-y-10 text-zinc-300">
          <div>
            <h2 className="text-2xl font-bold text-white">Éditeur du site</h2>
            <p className="mt-4">
              Le site legacymusicgroup.fr est édité par Legacy Music Group.
            </p>
            <p className="mt-2">
              Responsable de publication : Legacy Music Group
            </p>
            <p className="mt-2">
              Email : contact@legacymusicgroup.fr
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Hébergement</h2>
            <p className="mt-4">
              Le site est hébergé par Vercel Inc.
            </p>
            <p className="mt-2">
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Propriété intellectuelle
            </h2>
            <p className="mt-4 leading-8">
              L’ensemble des contenus présents sur ce site, incluant les textes,
              visuels, logos, éléments graphiques, photographies, vidéos et
              créations, est protégé par le droit de la propriété intellectuelle.
              Toute reproduction, diffusion ou utilisation non autorisée est
              interdite.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Responsabilité
            </h2>
            <p className="mt-4 leading-8">
              Legacy Music Group s’efforce de fournir des informations fiables
              et à jour. Toutefois, des erreurs ou omissions peuvent apparaître.
              L’utilisateur reste responsable de l’utilisation des informations
              disponibles sur le site.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Contact
            </h2>
            <p className="mt-4">
              Pour toute question, vous pouvez nous contacter à :
              contact@legacymusicgroup.fr
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}