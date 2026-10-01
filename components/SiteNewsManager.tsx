"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type NewsArticle = {
  id: string;
  slug: string;
  title_fr: string | null;
  title_en: string | null;
  excerpt_fr: string | null;
  excerpt_en: string | null;
  content_fr: string | null;
  content_en: string | null;
  category_fr: string | null;
  category_en: string | null;
  image_url: string | null;
  status: "draft" | "published";
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type NewsForm = {
  title_fr: string;
  title_en: string;
  slug: string;
  excerpt_fr: string;
  excerpt_en: string;
  content_fr: string;
  content_en: string;
  category_fr: string;
  category_en: string;
  image_url: string;
  status: "draft" | "published";
  featured: boolean;
  published_at: string;
};

const emptyForm: NewsForm = {
  title_fr: "",
  title_en: "",
  slug: "",
  excerpt_fr: "",
  excerpt_en: "",
  content_fr: "",
  content_en: "",
  category_fr: "",
  category_en: "",
  image_url: "",
  status: "draft",
  featured: false,
  published_at: "",
};

function toDateTimeLocal(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const local = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return local.toISOString().slice(0, 16);
}

function articleToForm(
  article: NewsArticle
): NewsForm {
  return {
    title_fr: article.title_fr || "",
    title_en: article.title_en || "",
    slug: article.slug || "",
    excerpt_fr: article.excerpt_fr || "",
    excerpt_en: article.excerpt_en || "",
    content_fr: article.content_fr || "",
    content_en: article.content_en || "",
    category_fr: article.category_fr || "",
    category_en: article.category_en || "",
    image_url: article.image_url || "",
    status: article.status || "draft",
    featured: Boolean(article.featured),
    published_at: toDateTimeLocal(
      article.published_at
    ),
  };
}

export default function SiteNewsManager() {
  const [articles, setArticles] = useState<
    NewsArticle[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<
    string | null
  >(null);

  const [form, setForm] =
    useState<NewsForm>(emptyForm);

  async function loadNews() {
    setLoading(true);

    const response = await fetch(
      "/api/site-internet/news",
      {
        cache: "no-store",
      }
    );

    const result = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      alert(
        result.error ||
          "Chargement des actualités impossible."
      );

      setLoading(false);
      return;
    }

    setArticles(
      (result.news || []) as NewsArticle[]
    );

    setLoading(false);
  }

  useEffect(() => {
    loadNews();
  }, []);

  const publishedCount = useMemo(
    () =>
      articles.filter(
        (article) =>
          article.status === "published"
      ).length,
    [articles]
  );

  const draftCount = useMemo(
    () =>
      articles.filter(
        (article) =>
          article.status === "draft"
      ).length,
    [articles]
  );

  const featuredCount = useMemo(
    () =>
      articles.filter(
        (article) => article.featured
      ).length,
    [articles]
  );

  function updateField<K extends keyof NewsForm>(
    field: K,
    value: NewsForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEditing(article: NewsArticle) {
    setEditingId(article.id);
    setForm(articleToForm(article));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveArticle(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.title_fr && !form.title_en) {
      alert(
        "Ajoute au moins un titre français ou anglais."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      ...form,
      ...(editingId
        ? {
            id: editingId,
          }
        : {}),
      published_at: form.published_at
        ? new Date(
            form.published_at
          ).toISOString()
        : null,
    };

    const response = await fetch(
      "/api/site-internet/news",
      {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      alert(
        result.error ||
          "Enregistrement impossible."
      );

      setSaving(false);
      return;
    }

    setSaving(false);
    resetForm();

    setMessage(
      editingId
        ? "Article modifié."
        : "Article créé."
    );

    await loadNews();

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  async function deleteArticle(
    article: NewsArticle
  ) {
    const confirmed = window.confirm(
      `Supprimer définitivement "${
        article.title_fr ||
        article.title_en ||
        article.slug
      }" ?`
    );

    if (!confirmed) return;

    const response = await fetch(
      "/api/site-internet/news",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: article.id,
        }),
      }
    );

    const result = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      alert(
        result.error ||
          "Suppression impossible."
      );
      return;
    }

    if (editingId === article.id) {
      resetForm();
    }

    await loadNews();

    setMessage("Article supprimé.");

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <p className="text-zinc-400">
          Chargement des actualités...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              href="/site-internet"
              className="text-sm text-zinc-500 transition hover:text-white"
            >
              ← Site Internet
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500">
              Pilotage éditorial
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              News
            </h1>

            <p className="mt-4 max-w-2xl text-zinc-400">
              Crée, modifie et publie les
              actualités officielles de LMG
              Music.
            </p>
          </div>

          <a
            href="https://www.lmgmusic.fr/news"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
          >
            Voir les News →
          </a>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total"
            value={articles.length}
          />

          <Stat
            label="Publiées"
            value={publishedCount}
          />

          <Stat
            label="Brouillons"
            value={draftCount}
          />

          <Stat
            label="Featured"
            value={featuredCount}
          />
        </section>

        {message && (
          <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {message}
          </div>
        )}

        <section className="mt-10 rounded-[2rem] border border-zinc-900 bg-zinc-950 p-6 md:p-8">
          <div className="flex flex-col gap-4 border-b border-zinc-900 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
                {editingId
                  ? "Modification"
                  : "Nouvel article"}
              </p>

              <h2 className="mt-2 text-2xl font-black">
                {editingId
                  ? "Modifier l’actualité"
                  : "Créer une actualité"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-fit rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white"
              >
                Annuler la modification
              </button>
            )}
          </div>

          <form
            onSubmit={saveArticle}
            className="mt-8 space-y-8"
          >
            <div className="grid gap-6 xl:grid-cols-2">
              <LanguageFields
                language="FR"
                title={form.title_fr}
                excerpt={form.excerpt_fr}
                content={form.content_fr}
                category={form.category_fr}
                onTitle={(value) =>
                  updateField(
                    "title_fr",
                    value
                  )
                }
                onExcerpt={(value) =>
                  updateField(
                    "excerpt_fr",
                    value
                  )
                }
                onContent={(value) =>
                  updateField(
                    "content_fr",
                    value
                  )
                }
                onCategory={(value) =>
                  updateField(
                    "category_fr",
                    value
                  )
                }
              />

              <LanguageFields
                language="EN"
                title={form.title_en}
                excerpt={form.excerpt_en}
                content={form.content_en}
                category={form.category_en}
                onTitle={(value) =>
                  updateField(
                    "title_en",
                    value
                  )
                }
                onExcerpt={(value) =>
                  updateField(
                    "excerpt_en",
                    value
                  )
                }
                onContent={(value) =>
                  updateField(
                    "content_en",
                    value
                  )
                }
                onCategory={(value) =>
                  updateField(
                    "category_en",
                    value
                  )
                }
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Slug">
                <input
                  value={form.slug}
                  onChange={(event) =>
                    updateField(
                      "slug",
                      event.target.value
                    )
                  }
                  placeholder="deepa-nouvelle-release"
                  className="input"
                />
              </Field>

              <Field label="Image URL">
                <input
                  value={form.image_url}
                  onChange={(event) =>
                    updateField(
                      "image_url",
                      event.target.value
                    )
                  }
                  placeholder="https://..."
                  className="input"
                />
              </Field>

              <Field label="Statut">
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value as
                        | "draft"
                        | "published"
                    )
                  }
                  className="input"
                >
                  <option value="draft">
                    Brouillon
                  </option>

                  <option value="published">
                    Publié
                  </option>
                </select>
              </Field>

              <Field label="Date de publication">
                <input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(event) =>
                    updateField(
                      "published_at",
                      event.target.value
                    )
                  }
                  className="input"
                />
              </Field>
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  updateField(
                    "featured",
                    event.target.checked
                  )
                }
              />

              <span className="text-sm">
                Mettre cette actualité en avant
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-yellow-500 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Enregistrement..."
                : editingId
                  ? "Enregistrer les modifications"
                  : "Créer l’article"}
            </button>
          </form>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
                Bibliothèque éditoriale
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Actualités
              </h2>
            </div>

            <p className="text-sm text-zinc-500">
              {articles.length} article
              {articles.length > 1 ? "s" : ""}
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
              Aucune actualité pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="rounded-[2rem] border border-zinc-900 bg-zinc-950 p-6"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>
                          {article.status ===
                          "published"
                            ? "Publié"
                            : "Brouillon"}
                        </Badge>

                        {article.featured && (
                          <Badge>Featured</Badge>
                        )}

                        {(article.category_fr ||
                          article.category_en) && (
                          <span className="text-xs uppercase tracking-[0.2em] text-yellow-500">
                            {article.category_fr ||
                              article.category_en}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-xl font-black">
                        {article.title_fr ||
                          article.title_en ||
                          article.slug}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        /news/{article.slug}
                      </p>

                      {article.published_at && (
                        <p className="mt-2 text-sm text-zinc-600">
                          {new Date(
                            article.published_at
                          ).toLocaleString(
                            "fr-FR"
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {article.status ===
                        "published" && (
                        <a
                          href={`https://www.lmgmusic.fr/news/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-zinc-700 px-4 py-2 text-sm transition hover:border-yellow-500 hover:text-yellow-500"
                        >
                          Voir →
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          startEditing(article)
                        }
                        className="rounded-full border border-zinc-700 px-4 py-2 text-sm transition hover:border-white"
                      >
                        Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteArticle(article)
                        }
                        className="rounded-full border border-red-900/60 px-4 py-2 text-sm text-red-400 transition hover:border-red-500"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function LanguageFields({
  language,
  title,
  excerpt,
  content,
  category,
  onTitle,
  onExcerpt,
  onContent,
  onCategory,
}: {
  language: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  onTitle: (value: string) => void;
  onExcerpt: (value: string) => void;
  onContent: (value: string) => void;
  onCategory: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-900 p-5">
      <p className="mb-5 text-xs font-black uppercase tracking-[0.3em] text-yellow-500">
        {language}
      </p>

      <div className="space-y-5">
        <Field label={`Titre ${language}`}>
          <input
            value={title}
            onChange={(event) =>
              onTitle(event.target.value)
            }
            className="input"
          />
        </Field>

        <Field label={`Catégorie ${language}`}>
          <input
            value={category}
            onChange={(event) =>
              onCategory(event.target.value)
            }
            placeholder={
              language === "FR"
                ? "Actualité"
                : "News"
            }
            className="input"
          />
        </Field>

        <Field label={`Extrait ${language}`}>
          <textarea
            value={excerpt}
            onChange={(event) =>
              onExcerpt(event.target.value)
            }
            rows={3}
            className="input resize-y"
          />
        </Field>

        <Field label={`Contenu ${language}`}>
          <textarea
            value={content}
            onChange={(event) =>
              onContent(event.target.value)
            }
            rows={10}
            className="input resize-y"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-zinc-400">
        {label}
      </span>

      {children}
    </label>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
      {children}
    </span>
  );
}
