import Link from "next/link";

export const metadata = {
  title: "LMG OS | Legacy Music Group",
  description:
    "LMG OS est la plateforme interne de pilotage de Legacy Music Group.",
};

export default function LmgOsPresentationPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-16">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            Legacy Music Group
          </p>

          <h1 className="mt-5 text-5xl font-bold md:text-7xl">
            LMG OS
          </h1>

          <p className="mt-6 max-w-3xl text-xl leading-9 text-zinc-400">
            LMG OS est la plateforme interne de pilotage de
            Legacy Music Group. Elle permet aux membres autorisés
            de gérer leurs tâches, artistes, projets, sorties,
            bookings, relances et échéances professionnelles.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-2xl font-bold">
              À quoi sert LMG OS ?
            </h2>

            <p className="mt-4 leading-7 text-zinc-400">
              La plateforme centralise l’organisation et le suivi
              des activités de Legacy Music Group afin que chaque
              utilisateur retrouve uniquement les informations et
              échéances qui le concernent.
            </p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-2xl font-bold">
              Intégration Google Calendar
            </h2>

            <p className="mt-4 leading-7 text-zinc-400">
              Avec son autorisation, un utilisateur peut connecter
              son compte Google Calendar afin d’y synchroniser ses
              événements professionnels LMG OS : tâches, bookings,
              rollout, relances et actions liées aux sorties.
            </p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-2xl font-bold">
              Utilisation des données Google
            </h2>

            <p className="mt-4 leading-7 text-zinc-400">
              LMG OS utilise l’autorisation Google Calendar
              uniquement pour créer, mettre à jour et supprimer les
              événements professionnels synchronisés par
              l’utilisateur. Ces données ne sont ni vendues ni
              utilisées à des fins publicitaires.
            </p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-2xl font-bold">
              Accès sécurisé
            </h2>

            <p className="mt-4 leading-7 text-zinc-400">
              L’accès à LMG OS est réservé aux utilisateurs
              disposant d’un compte autorisé. Chaque agenda est
              personnel et ne reçoit que les éléments rattachés à
              l’utilisateur connecté.
            </p>
          </article>
        </section>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-bold">
            Contrôle de la connexion
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-zinc-400">
            La connexion à Google Calendar est facultative.
            L’utilisateur peut choisir de ne pas connecter son
            calendrier ou retirer l’accès depuis les paramètres de
            sécurité de son compte Google.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-black transition hover:bg-zinc-200"
            >
              Accéder à LMG OS
            </Link>

            <Link
              href="/site/confidentialite"
              className="rounded-2xl border border-zinc-700 px-6 py-4 text-center font-semibold text-white transition hover:border-zinc-500"
            >
              Politique de confidentialité
            </Link>

            <Link
              href="/site"
              className="rounded-2xl border border-zinc-700 px-6 py-4 text-center font-semibold text-white transition hover:border-zinc-500"
            >
              Legacy Music Group
            </Link>
          </div>
        </section>

        <footer className="mt-12 border-t border-zinc-900 pt-8 text-sm text-zinc-500">
          <p>
            Contact : contactlmgmusic@gmail.com
          </p>

          <p className="mt-2">
            © 2026 Legacy Music Group — LMG OS
          </p>
        </footer>
      </div>
    </main>
  );
}