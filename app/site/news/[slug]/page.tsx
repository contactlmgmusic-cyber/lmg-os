import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { supabase } from "@/lib/supabase";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

type Params = Promise<{
  slug: string;
}>;

async function getArticle(slug: string) {
  const { data } = await supabase
    .from("site_news")
    .select(`
      id,
      slug,
      title_fr,
      title_en,
      excerpt_fr,
      excerpt_en,
      content_fr,
      content_en,
      category_fr,
      category_en,
      image_url,
      featured,
      published_at
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .limit(1);

  return data?.[0] || null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Actualité introuvable | LMG Music",
    };
  }

  const title =
    article.title_fr ||
    article.title_en ||
    "LMG Music";

  const description =
    article.excerpt_fr ||
    article.excerpt_en ||
    "Découvrez les dernières actualités de LMG Music.";

  return {
    title: `${title} | LMG Music`,
    description: description.slice(0, 160),

    alternates: {
      canonical: `https://www.lmgmusic.fr/news/${slug}`,
    },

    openGraph: {
      title: `${title} | LMG Music`,
      description: description.slice(0, 160),
      url: `https://www.lmgmusic.fr/news/${slug}`,
      siteName: "LMG Music",
      type: "article",
      publishedTime:
        article.published_at || undefined,
      images: article.image_url
        ? [
            {
              url: article.image_url,
              alt: title,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: `${title} | LMG Music`,
      description: description.slice(0, 160),
      images: article.image_url
        ? [article.image_url]
        : [],
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const title =
    article.title_fr ||
    article.title_en ||
    "LMG Music";

  const excerpt =
    article.excerpt_fr ||
    article.excerpt_en;

  const content =
    article.content_fr ||
    article.content_en;

  const category =
    article.category_fr ||
    article.category_en ||
    "Actualité";

  const publicationDate =
    article.published_at
      ? new Date(
          article.published_at
        ).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: excerpt || undefined,
    image: article.image_url
      ? [article.image_url]
      : undefined,
    datePublished:
      article.published_at || undefined,
    mainEntityOfPage: `https://www.lmgmusic.fr/news/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "LMG Music",
      url: "https://www.lmgmusic.fr",
    },
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />

      <Navbar />

      <article>
        <header className="relative overflow-hidden border-b border-zinc-900">
          {article.image_url && (
            <Image
              src={article.image_url}
              alt=""
              fill
              priority
              className="object-cover object-center opacity-45"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

          <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-end px-6 pb-20 pt-36 md:px-8 md:pb-24">
            <div className="max-w-5xl">
              <Link
                href="/news"
                className="text-sm text-white/60 transition hover:text-white"
              >
                ← Retour aux actualités
              </Link>

              <div className="mt-16 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-500">
                  {category}
                </span>

                {publicationDate && (
                  <>
                    <span className="text-zinc-600">
                      •
                    </span>

                    <span className="text-sm text-zinc-400">
                      {publicationDate}
                    </span>
                  </>
                )}
              </div>

              <h1 className="mt-6 max-w-5xl text-5xl font-black uppercase leading-[0.95] md:text-7xl xl:text-8xl">
                {title}
              </h1>

              {excerpt && (
                <p className="mt-8 max-w-3xl text-xl leading-9 text-zinc-300">
                  {excerpt}
                </p>
              )}
            </div>
          </div>
        </header>

        <section className="px-6 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[220px_1fr]">
            <aside>
              <div className="sticky top-32">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
                  LMG Music
                </p>

                {publicationDate && (
                  <p className="mt-4 text-sm leading-6 text-zinc-500">
                    Publié le
                    <br />
                    {publicationDate}
                  </p>
                )}

                <div className="mt-8 h-px w-16 bg-yellow-500" />
              </div>
            </aside>

            <div className="max-w-3xl">
              {content ? (
                <div className="whitespace-pre-line text-lg leading-9 text-zinc-300 md:text-xl md:leading-10">
                  {content}
                </div>
              ) : excerpt ? (
                <div className="text-lg leading-9 text-zinc-300 md:text-xl">
                  {excerpt}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-900 bg-zinc-950 px-6 py-20 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
                LMG Music News
              </p>

              <h2 className="mt-3 text-3xl font-black uppercase md:text-4xl">
                Découvrir nos actualités
              </h2>
            </div>

            <Link
              href="/news"
              className="w-fit rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
            >
              Toutes les actualités →
            </Link>
          </div>
        </section>
      </article>

      <Footer />
    </main>
  );
}
