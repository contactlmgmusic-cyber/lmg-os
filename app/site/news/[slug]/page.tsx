import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { supabase } from "@/lib/supabase";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import MusicNewsArticle from "@/components/site/MusicNewsArticle";

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
      title: "News | LMG Music",
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

  const url =
    `https://www.lmgmusic.fr/news/${slug}`;

  return {
    title: `${title} | LMG Music`,
    description: description.slice(0, 160),

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: `${title} | LMG Music`,
      description: description.slice(0, 160),
      url,
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
    mainEntityOfPage:
      `https://www.lmgmusic.fr/news/${slug}`,
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

      <MusicNewsArticle article={article} />

      <Footer />
    </main>
  );
}
