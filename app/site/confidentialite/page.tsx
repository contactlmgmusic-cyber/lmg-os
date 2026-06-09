import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <section className="mx-auto max-w-4xl">
        <Link href="/site" className="text-sm text-zinc-400 hover:text-white">
          ← Retour au site
        </Link>

        <h1 className="mt-10 text-5xl font-black uppercase">
          Politique de confidentialité
        </h1>

        <div className="mt-12 space-y-10 text-zinc-300">
          <div>
            <h2 className="text-2xl font-bold text-white">Données collectées</h2>
            <p className="mt-4 leading-8">
              Le site peut collecter les informations transmises via le
              formulaire de candidature : nom d’artiste, ville, email,
              téléphone, réseaux sociaux, liens musicaux et message.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Finalité de la collecte
            </h2>
            <p className="mt-4 leading-8">
              Ces données sont utilisées uniquement pour étudier les
              candidatures, contacter les artistes et assurer le suivi des
              demandes reçues par Legacy Music Group.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Durée de conservation</h2>
            <p className="mt-4 leading-8">
              Les données sont conservées pendant une durée raisonnable
              nécessaire au traitement des candidatures, sauf demande de
              suppression de la part de la personne concernée.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Vos droits</h2>
            <p className="mt-4 leading-8">
              Conformément à la réglementation applicable, vous pouvez demander
              l’accès, la rectification ou la suppression de vos données en nous
              contactant à : contact@legacymusicgroup.fr.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Outils de mesure</h2>
            <p className="mt-4 leading-8">
              Le site utilise Google Analytics afin de mesurer l’audience et
              améliorer l’expérience utilisateur. Les données collectées sont
              utilisées à des fins statistiques.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Contact</h2>
            <p className="mt-4">
              Pour toute question relative à vos données personnelles :
              contact@legacymusicgroup.fr
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}