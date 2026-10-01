"use client";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function CookiesPage() {
  const { locale } = useSiteLanguage();
  const fr = locale === "fr";

  function openCookieSettings() {
    window.dispatchEvent(
      new Event("lmg-open-cookie-settings")
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white">
        {/* HERO */}
        <section className="border-b border-zinc-900 px-6 pb-16 pt-32 md:px-8 md:pb-20 md:pt-40">
          <div className="mx-auto max-w-7xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-yellow-500">
              LMG MUSIC
            </p>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.03em] md:text-6xl">
              {fr ? "Politique de cookies" : "Cookie Policy"}
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
              {fr
                ? "Cette politique explique comment LMG Music utilise les cookies et technologies similaires sur son site."
                : "This policy explains how LMG Music uses cookies and similar technologies on its website."}
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="px-6 py-16 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[260px_1fr] lg:gap-20">
            <aside>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                {fr ? "Confidentialité" : "Privacy"}
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                {fr
                  ? "Dernière mise à jour : octobre 2026"
                  : "Last updated: October 2026"}
              </p>
            </aside>

            <div className="max-w-3xl space-y-14">
              <section>
                <h2 className="text-2xl font-semibold">
                  {fr
                    ? "1. Qu’est-ce qu’un cookie ?"
                    : "1. What is a cookie?"}
                </h2>

                <p className="mt-5 text-sm leading-7 text-zinc-400">
                  {fr
                    ? "Un cookie est une petite quantité d’information enregistrée ou consultée sur votre appareil lorsque vous utilisez un site internet. Certaines technologies sont indispensables au fonctionnement du site, tandis que d’autres peuvent être utilisées, avec votre accord, pour mesurer son audience."
                    : "A cookie is a small amount of information stored or accessed on your device when you use a website. Some technologies are necessary for the website to function, while others may be used, with your permission, to measure its audience."}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">
                  {fr
                    ? "2. Cookies nécessaires"
                    : "2. Necessary cookies"}
                </h2>

                <p className="mt-5 text-sm leading-7 text-zinc-400">
                  {fr
                    ? "Ces éléments sont nécessaires au bon fonctionnement du site et à la mémorisation de vos préférences de confidentialité. Ils ne peuvent pas être désactivés depuis notre gestionnaire de consentement."
                    : "These elements are required for the website to operate correctly and to remember your privacy preferences. They cannot be disabled through our consent manager."}
                </p>

                <div className="mt-6 border-y border-zinc-900 py-5">
                  <div className="grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600">
                        {fr ? "Élément" : "Item"}
                      </p>
                      <p className="mt-2 text-zinc-300">
                        lmg-music-cookie-consent
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600">
                        {fr ? "Finalité" : "Purpose"}
                      </p>
                      <p className="mt-2 text-zinc-300">
                        {fr
                          ? "Mémorisation de vos choix"
                          : "Stores your preferences"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600">
                        {fr ? "Type" : "Type"}
                      </p>
                      <p className="mt-2 text-zinc-300">
                        Local Storage
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">
                  {fr
                    ? "3. Mesure d’audience"
                    : "3. Audience measurement"}
                </h2>

                <p className="mt-5 text-sm leading-7 text-zinc-400">
                  {fr
                    ? "Avec votre consentement, LMG Music utilise Google Analytics afin de comprendre l’utilisation du site, notamment la fréquentation et les interactions avec les pages. Google Analytics n’est chargé qu’après votre acceptation des cookies Analytics."
                    : "With your consent, LMG Music uses Google Analytics to understand how the website is used, including traffic and interactions with its pages. Google Analytics is only loaded after you accept Analytics cookies."}
                </p>

                <div className="mt-6 border-y border-zinc-900 py-5">
                  <div className="grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600">
                        Service
                      </p>
                      <p className="mt-2 text-zinc-300">
                        Google Analytics
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600">
                        {fr ? "Finalité" : "Purpose"}
                      </p>
                      <p className="mt-2 text-zinc-300">
                        {fr
                          ? "Mesure d’audience"
                          : "Audience measurement"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600">
                        {fr ? "Consentement" : "Consent"}
                      </p>
                      <p className="mt-2 text-zinc-300">
                        {fr ? "Requis" : "Required"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">
                  {fr
                    ? "4. Votre choix"
                    : "4. Your choice"}
                </h2>

                <p className="mt-5 text-sm leading-7 text-zinc-400">
                  {fr
                    ? "Lors de votre première visite, vous pouvez accepter les cookies Analytics, les refuser ou personnaliser vos préférences. Votre choix est enregistré dans votre navigateur afin que nous puissions le respecter lors de vos prochaines visites."
                    : "On your first visit, you can accept Analytics cookies, reject them or customize your preferences. Your choice is stored in your browser so that we can respect it on future visits."}
                </p>

                <button
                  type="button"
                  onClick={openCookieSettings}
                  className="mt-7 inline-flex items-center gap-4 rounded-full bg-yellow-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
                >
                  {fr
                    ? "Gérer mes préférences"
                    : "Manage my preferences"}
                  <span aria-hidden="true">→</span>
                </button>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">
                  {fr
                    ? "5. Modifier ou retirer votre consentement"
                    : "5. Change or withdraw your consent"}
                </h2>

                <p className="mt-5 text-sm leading-7 text-zinc-400">
                  {fr
                    ? "Vous pouvez modifier votre choix à tout moment depuis le lien « Personnaliser les cookies » ou l’icône cookie présents dans le pied de page du site."
                    : "You can change your choice at any time using the “Customize Cookies” link or the cookie icon available in the website footer."}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">
                  {fr
                    ? "6. Mise à jour de cette politique"
                    : "6. Updates to this policy"}
                </h2>

                <p className="mt-5 text-sm leading-7 text-zinc-400">
                  {fr
                    ? "Cette politique peut être mise à jour afin de refléter l’évolution du site, des services utilisés ou des obligations applicables. La date de dernière mise à jour est indiquée en haut de cette page."
                    : "This policy may be updated to reflect changes to the website, the services used or applicable requirements. The latest update date is displayed at the top of this page."}
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
