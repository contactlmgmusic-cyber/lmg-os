import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { supabase } from "@/lib/supabase";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "News | LMG Music",
  description:
    "Découvrez les dernières actualités, annonces et projets de LMG Music.",
  alternates: {
    canonical: "https://www.lmgmusic.fr/news",
  },
};

export default async function NewsPage() {
  const { data } = await supabase
    .from("site_news")
    .select(`
      id,
      slug,
      title_fr,
      excerpt_fr,
      category_fr,
      image_url,
      featured,
      published_at
    `)
    .eq("status", "published")
    .not("slug", "is", null)
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  const articles = data || [];

  const featuredArticle =
    articles.find((article) => article.featured) ||
    articles[0] ||
    null;

  const remainingArticles = featuredArticle
    ? articles.filter(
        (article) =>
          article.id !== featuredArticle.id
      )
    : articles;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="border-b border-zinc-900 px-6 pb-20 pt-36 md:px-8 md:pb-28">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            ← Retour au site
          </Link>

          <p className="mt-16 text-sm uppercase tracking-[0.4em] text-yellow-500">
            LMG Music
          </p>

          <h1 className="mt-5 text-6xl font-black uppercase leading-none md:text-8xl">
            News
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
            Actualités, annonces, projets et temps forts
            de LMG Music.
          </p>
        </div>
      </section>

      {featuredArticle && (
        <section className="border-b border-zinc-900 bg-zinc-950 px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <p className="mb-8 text-sm uppercase tracking-[0.35em] text-yellow-500">
              Featured Story
            </p>

            <Link
              href={`/news/${featuredArticle.slug}`}
              className="group relative block min-h-[560px] overflow-hidden rounded-[2rem] border border-zinc-800 bg-black"
            >
              {featuredArticle.image_url ? (
                <Image
                  src={featuredArticle.image_url}
                  alt={
                    featuredArticle.title_fr ||
                    "Actualité LMG Music"
                  }
                  fill
                  priority
                  className="object-cover object-center transition duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="absolute inset-0 bg-zinc-900" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              <div className="relative z-10 flex min-h-[560px] max-w-4xl flex-col justify-end p-8 md:p-14">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
                    {featuredArticle.category_fr ||
                      "Actualité"}
                  </p>

                  {featuredArticle.published_at && (
                    <>
                      <span className="text-zinc-600">
                        •
                      </span>

                      <p className="text-sm text-zinc-400">
                        {new Date(
                          featuredArticle.published_at
                        ).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </>
                  )}
                </div>

                <h2 className="mt-5 max-w-4xl text-4xl font-black uppercase leading-[0.95] md:text-6xl">
                  {featuredArticle.title_fr}
                </h2>

                {featuredArticle.excerpt_fr && (
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                    {featuredArticle.excerpt_fr}
                  </p>
                )}

                <span className="mt-8 font-semibold">
                  Lire l&apos;actualité →
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Latest
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
              Dernières actualités
            </h2>
          </div>

          {remainingArticles.length > 0 ? (
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {remainingArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-zinc-900 bg-zinc-950">
                    {article.image_url ? (
                      <Image
                        src={article.image_url}
                        alt={
                          article.title_fr ||
                          "Actualité LMG Music"
                        }
                        fill
                        className="object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.25em] text-zinc-700">
                        LMG Music
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
                        {article.category_fr ||
                          "Actualité"}
                      </p>

                      {article.published_at && (
                        <p className="text-xs text-zinc-600">
                          {new Date(
                            article.published_at
                          ).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      )}
                    </div>

                    <h3 className="mt-4 text-2xl font-black leading-tight transition group-hover:text-yellow-500">
                      {article.title_fr}
                    </h3>

                    {article.excerpt_fr && (
                      <p className="mt-4 line-clamp-3 leading-7 text-zinc-500">
                        {article.excerpt_fr}
                      </p>
                    )}

                    <p className="mt-6 text-sm font-semibold">
                      Lire →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : featuredArticle ? null : (
            <div className="border-y border-zinc-900 py-24 text-center text-zinc-500">
              Aucune actualité publiée pour le moment.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
