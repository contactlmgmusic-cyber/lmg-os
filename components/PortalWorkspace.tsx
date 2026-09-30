"use client";

import { useEffect, useRef, useState } from "react";

import {
  fields,
  type PortalEntry,
  type PortalKind,
  type PortalSection,
} from "@/lib/portal/content";
import { savePortalEntry } from "@/app/(os)/portail-groupe/actions";
import { supabaseBrowser } from "@/lib/supabase-browser";

const inputClass =
  "mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white focus:outline-2 focus:outline-yellow-500";

export default function PortalWorkspace({
  initialEntries,
  initialMedia,
}: {
  initialEntries: PortalEntry[];
  initialMedia: { name: string; url: string }[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [selected, setSelected] =
    useState<PortalEntry | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState(initialMedia);
  const [mediaUrl, setMediaUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };

    window.addEventListener("beforeunload", guard);

    return () =>
      window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  function choose(entry: PortalEntry) {
    if (
      dirty &&
      !window.confirm(
        "Abandonner les modifications non enregistrées ?"
      )
    ) {
      return;
    }

    setSelected(structuredClone(entry));
    setDirty(false);
    setMessage("");
  }

  function create(kind: PortalKind) {
    choose({
      id: "",
      kind,
      slug: "",
      status: "draft",
      updated_at: "",
      data:
        kind === "news"
          ? {
              title: "",
              titleEn: "",
              intro: "",
              introEn: "",
              category: "Vie du groupe",
              categoryEn: "Group",
              publishedAt: new Intl.DateTimeFormat(
                "en-CA",
                {
                  timeZone: "Europe/Paris",
                }
              ).format(new Date()),
              sections: [
                {
                  title: "",
                  text: "",
                  titleEn: "",
                  textEn: "",
                },
              ],
            }
          : {
              title: "",
              intro: "",
              division: "Music",
              category: "",
              image: "",
              alt: "",
              heading: "",
              body: "",
              context: "",
              focus: "",
              href: "",
              linkLabel: "",
              sections: [],
            },
    });
  }

  function change(key: string, value: string) {
    if (!selected) return;

    setSelected({
      ...selected,
      data: {
        ...selected.data,
        [key]: value,
      },
    });

    setDirty(true);
  }

  function updateSection(
    index: number,
    key: keyof PortalSection,
    value: string
  ) {
    if (!selected) return;

    const sections = getSections();

    setSelected({
      ...selected,
      data: {
        ...selected.data,
        sections: sections.map((section, i) =>
          i === index
            ? {
                ...section,
                [key]: value,
              }
            : section
        ),
      },
    });

    setDirty(true);
  }

  function getSections(): PortalSection[] {
    if (
      !selected ||
      !Array.isArray(selected.data.sections)
    ) {
      return [];
    }

    return selected.data.sections;
  }

  function addSection() {
    if (!selected) return;

    const sections = getSections();

    const section: PortalSection =
      selected.kind === "news"
        ? {
            title: "",
            text: "",
            titleEn: "",
            textEn: "",
          }
        : {
            title: "",
            text: "",
          };

    setSelected({
      ...selected,
      data: {
        ...selected.data,
        sections: [...sections, section],
      },
    });

    setDirty(true);
  }

  function removeSection(index: number) {
    if (!selected) return;

    const sections = getSections();

    setSelected({
      ...selected,
      data: {
        ...selected.data,
        sections: sections.filter(
          (_, i) => i !== index
        ),
      },
    });

    setDirty(true);
  }

  async function save(
    status: "draft" | "published"
  ) {
    if (!selected) return;

    setBusy(true);
    setMessage("");

    try {
      const result = await savePortalEntry({
        ...selected,
        status,
      });

      if (result.error || !result.entry) {
        setMessage(
          result.error ||
            "Échec de l’enregistrement."
        );
        return;
      }

      const saved = result.entry;

      setEntries((current) => [
        saved,
        ...current.filter(
          (entry) => entry.id !== saved.id
        ),
      ]);

      setSelected(saved);
      setDirty(false);

      setMessage(
        status === "published"
          ? "Contenu publié. Il est maintenant disponible sur le portail LMG Group."
          : "Brouillon enregistré. Ce contenu n’est pas visible publiquement."
      );
    } catch {
      setMessage(
        "La connexion a été interrompue. Vos modifications sont conservées dans ce formulaire."
      );
    } finally {
      setBusy(false);
    }
  }

  async function upload(file?: File) {
    if (!file) return;

    if (
      ![
        "image/png",
        "image/jpeg",
        "image/webp",
      ].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setMessage(
        "Choisissez une image PNG, JPEG ou WebP de 5 Mo maximum."
      );
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const extension = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
      }[file.type];

      const name = `${crypto.randomUUID()}.${extension}`;

      const { error } =
        await supabaseBrowser.storage
          .from("portal-media")
          .upload(name, file, {
            contentType: file.type,
            upsert: false,
          });

      if (error) throw error;

      const { data } =
        supabaseBrowser.storage
          .from("portal-media")
          .getPublicUrl(name);

      setMediaUrl(data.publicUrl);

      setMedia((current) =>
        [
          {
            name,
            url: data.publicUrl,
          },
          ...current,
        ].slice(0, 100)
      );

      if (selected?.kind === "project") {
        change("image", data.publicUrl);
      }

      setMessage(
        "Visuel ajouté à la médiathèque publique."
      );
    } catch {
      setMessage(
        "Import impossible. Vérifiez le bucket portal-media et vos droits."
      );
    } finally {
      setBusy(false);

      if (fileInput.current) {
        fileInput.current.value = "";
      }
    }
  }

  const sections = getSections();

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <button
          disabled={busy}
          onClick={() => create("news")}
          className="rounded-lg bg-yellow-500 px-4 py-3 font-semibold text-black"
        >
          Nouvelle actualité
        </button>

        <button
          disabled={busy}
          onClick={() => create("project")}
          className="rounded-lg border border-zinc-700 px-4 py-3"
        >
          Nouveau projet
        </button>

        <a
          href="https://www.legacymusicgroup.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-3 text-zinc-300"
        >
          Voir le portail ↗
        </a>
      </div>

      <p className="my-5 text-sm text-zinc-400">
        {
          entries.filter(
            (entry) =>
              entry.status === "published"
          ).length
        }{" "}
        publiés ·{" "}
        {
          entries.filter(
            (entry) => entry.status === "draft"
          ).length
        }{" "}
        brouillons
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <aside
          className="space-y-2"
          aria-label="Contenus du portail"
        >
          {entries.map((entry) => (
            <button
              disabled={busy}
              key={entry.id}
              onClick={() => choose(entry)}
              aria-pressed={
                selected?.id === entry.id
              }
              className={`block w-full rounded-xl border p-4 text-left ${
                selected?.id === entry.id
                  ? "border-yellow-500"
                  : "border-zinc-800"
              }`}
            >
              <span className="text-xs text-zinc-400">
                {entry.kind === "news"
                  ? "Actualité"
                  : "Projet"}{" "}
                ·{" "}
                {entry.status === "published"
                  ? "Publié"
                  : "Brouillon"}
              </span>

              <strong className="mt-2 block">
                {String(entry.data.title)}
              </strong>
            </button>
          ))}

          {!entries.length && (
            <p className="text-zinc-400">
              Aucun contenu. Créez votre première
              publication.
            </p>
          )}
        </aside>

        <div className="min-w-0 rounded-xl border border-zinc-800 p-5 md:p-7">
          {selected ? (
            <form
              onSubmit={(event) =>
                event.preventDefault()
              }
            >
              <fieldset disabled={busy}>
                <legend className="mb-6 text-2xl font-semibold">
                  {selected.id
                    ? "Modifier"
                    : "Créer"}{" "}
                  {selected.kind === "news"
                    ? "une actualité"
                    : "un projet"}
                </legend>

                <label className="mb-7 block text-sm">
                  Adresse de la page
                  <input
                    className={inputClass}
                    value={selected.slug}
                    readOnly={Boolean(
                      selected.id
                    )}
                    onChange={(event) => {
                      setSelected({
                        ...selected,
                        slug: event.target.value,
                      });
                      setDirty(true);
                    }}
                    placeholder="mon-contenu"
                  />
                </label>

                {selected.kind === "news" ? (
                  <>
                    <LanguageBlock
                      title="🇫🇷 Français"
                      description="Contenu affiché lorsque le portail est consulté en français."
                    >
                      <TextField
                        label="Titre"
                        value={String(
                          selected.data.title || ""
                        )}
                        onChange={(value) =>
                          change("title", value)
                        }
                      />

                      <TextArea
                        label="Introduction"
                        value={String(
                          selected.data.intro || ""
                        )}
                        onChange={(value) =>
                          change("intro", value)
                        }
                      />

                      <TextField
                        label="Catégorie"
                        value={String(
                          selected.data.category ||
                            ""
                        )}
                        onChange={(value) =>
                          change("category", value)
                        }
                      />
                    </LanguageBlock>

                    <LanguageBlock
                      title="🇬🇧 English"
                      description="Content displayed when the portal is viewed in English."
                    >
                      <TextField
                        label="Title"
                        value={String(
                          selected.data.titleEn ||
                            ""
                        )}
                        onChange={(value) =>
                          change("titleEn", value)
                        }
                      />

                      <TextArea
                        label="Introduction"
                        value={String(
                          selected.data.introEn ||
                            ""
                        )}
                        onChange={(value) =>
                          change("introEn", value)
                        }
                      />

                      <TextField
                        label="Category"
                        value={String(
                          selected.data
                            .categoryEn || ""
                        )}
                        onChange={(value) =>
                          change(
                            "categoryEn",
                            value
                          )
                        }
                      />
                    </LanguageBlock>

                    <label className="mb-8 block text-sm">
                      Date de publication
                      <input
                        type="date"
                        className={inputClass}
                        value={String(
                          selected.data
                            .publishedAt || ""
                        )}
                        onChange={(event) =>
                          change(
                            "publishedAt",
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </>
                ) : (
                  fields.project.map(
                    ([key, label]) => (
                      <label
                        key={key}
                        className="mb-5 block text-sm"
                      >
                        {label}

                        {key === "division" ? (
                          <select
                            className={inputClass}
                            value={String(
                              selected.data[key] ||
                                "Music"
                            )}
                            onChange={(event) =>
                              change(
                                key,
                                event.target.value
                              )
                            }
                          >
                            {[
                              "Group",
                              "Music",
                              "Agency",
                            ].map((value) => (
                              <option
                                key={value}
                                value={value}
                              >
                                {value}
                              </option>
                            ))}
                          </select>
                        ) : [
                            "intro",
                            "body",
                          ].includes(key) ? (
                          <textarea
                            rows={
                              key === "body"
                                ? 7
                                : 3
                            }
                            className={inputClass}
                            value={String(
                              selected.data[key] ||
                                ""
                            )}
                            onChange={(event) =>
                              change(
                                key,
                                event.target.value
                              )
                            }
                          />
                        ) : (
                          <input
                            type="text"
                            className={inputClass}
                            value={String(
                              selected.data[key] ||
                                ""
                            )}
                            onChange={(event) =>
                              change(
                                key,
                                event.target.value
                              )
                            }
                          />
                        )}
                      </label>
                    )
                  )
                )}

                <section className="mt-8 border-t border-zinc-800 pt-7">
                  <h2 className="text-lg font-semibold">
                    Paragraphes
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    {selected.kind === "news"
                      ? "Chaque paragraphe doit être renseigné en français et en anglais."
                      : "Contenu détaillé du projet."}
                  </p>

                  <div className="mt-6 space-y-7">
                    {sections.map(
                      (section, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                        >
                          <p className="mb-5 text-xs font-bold uppercase tracking-wider text-yellow-500">
                            Paragraphe{" "}
                            {index + 1}
                          </p>

                          {selected.kind ===
                          "news" ? (
                            <div className="grid gap-6 xl:grid-cols-2">
                              <div>
                                <p className="mb-4 font-semibold">
                                  🇫🇷 Français
                                </p>

                                <TextField
                                  label="Titre"
                                  value={
                                    section.title
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateSection(
                                      index,
                                      "title",
                                      value
                                    )
                                  }
                                />

                                <TextArea
                                  label="Texte"
                                  rows={6}
                                  value={
                                    section.text
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateSection(
                                      index,
                                      "text",
                                      value
                                    )
                                  }
                                />
                              </div>

                              <div>
                                <p className="mb-4 font-semibold">
                                  🇬🇧 English
                                </p>

                                <TextField
                                  label="Title"
                                  value={
                                    section.titleEn ||
                                    ""
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateSection(
                                      index,
                                      "titleEn",
                                      value
                                    )
                                  }
                                />

                                <TextArea
                                  label="Text"
                                  rows={6}
                                  value={
                                    section.textEn ||
                                    ""
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateSection(
                                      index,
                                      "textEn",
                                      value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <TextField
                                label="Titre"
                                value={
                                  section.title
                                }
                                onChange={(value) =>
                                  updateSection(
                                    index,
                                    "title",
                                    value
                                  )
                                }
                              />

                              <TextArea
                                label="Texte"
                                rows={6}
                                value={
                                  section.text
                                }
                                onChange={(value) =>
                                  updateSection(
                                    index,
                                    "text",
                                    value
                                  )
                                }
                              />
                            </>
                          )}

                          {sections.length >
                            (selected.kind ===
                            "news"
                              ? 1
                              : 0) && (
                            <button
                              type="button"
                              className="mt-3 text-sm text-red-300"
                              onClick={() =>
                                removeSection(
                                  index
                                )
                              }
                            >
                              Retirer ce
                              paragraphe
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={
                      sections.length >= 20
                    }
                    className="mt-5 text-yellow-400"
                    onClick={addSection}
                  >
                    + Ajouter un paragraphe
                  </button>
                </section>

                <div className="mt-8 flex flex-wrap gap-3 border-t border-zinc-800 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        selected.status !==
                          "published" ||
                        window.confirm(
                          "Retirer ce contenu du portail public et le conserver en brouillon ?"
                        )
                      ) {
                        void save("draft");
                      }
                    }}
                    className="rounded-lg border border-zinc-600 px-4 py-3"
                  >
                    {selected.status ===
                    "published"
                      ? "Retirer de la publication"
                      : "Enregistrer le brouillon"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void save("published")
                    }
                    className="rounded-lg bg-yellow-500 px-4 py-3 font-semibold text-black"
                  >
                    {selected.status ===
                    "published"
                      ? "Mettre à jour la publication"
                      : "Publier"}
                  </button>
                </div>
              </fieldset>
            </form>
          ) : (
            <p className="text-zinc-400">
              Sélectionnez un contenu pour le
              modifier, ou créez une publication.
            </p>
          )}

          <section className="mt-8 border-t border-zinc-800 pt-6">
            <h2 className="text-lg font-semibold">
              Visuels du portail
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Les images importées sont publiques.
              PNG, JPEG ou WebP · 5 Mo maximum.
            </p>

            <label className="mt-4 block text-sm">
              Importer une image
              <input
                ref={fileInput}
                disabled={busy}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="mt-3 block w-full"
                onChange={(event) =>
                  void upload(
                    event.target.files?.[0]
                  )
                }
              />
            </label>

            {mediaUrl && (
              <label className="mt-4 block text-sm">
                Lien du visuel
                <input
                  readOnly
                  className={inputClass}
                  value={mediaUrl}
                  onFocus={(event) =>
                    event.target.select()
                  }
                />
              </label>
            )}

            <details className="mt-5">
              <summary className="cursor-pointer text-sm">
                Visuels récents ({media.length})
              </summary>

              <div className="mt-3 max-h-64 space-y-2 overflow-auto">
                {media.map((item) => (
                  <button
                    disabled={busy}
                    type="button"
                    key={item.name}
                    className="block w-full break-all rounded border border-zinc-700 p-3 text-left text-xs"
                    onClick={() => {
                      setMediaUrl(item.url);

                      if (
                        selected?.kind ===
                        "project"
                      ) {
                        change(
                          "image",
                          item.url
                        );
                      }
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </details>
          </section>

          <p
            role="status"
            aria-live="polite"
            className="mt-5 text-sm text-yellow-200"
          >
            {busy
              ? "Opération en cours…"
              : message}
          </p>
        </div>
      </div>
    </div>
  );
}

function LanguageBlock({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-1 mb-5 text-xs text-zinc-500">
        {description}
      </p>

      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mb-5 block text-sm">
      {label}
      <input
        type="text"
        className={inputClass}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="mb-5 block text-sm">
      {label}
      <textarea
        rows={rows}
        className={inputClass}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}
