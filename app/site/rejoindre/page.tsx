"use client";

import { useState } from "react";
import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";
import { supabaseBrowser } from "@/lib/supabase-browser";

const initialForm = {
  nom_artiste: "",
  ville: "",
  email: "",
  telephone: "",
  style_musical: "",
  stade_projet: "",
  equipe_actuelle: "",
  instagram: "",
  tiktok: "",
  spotify: "",
  lien_musique: "",
  objectifs: "",
  message: "",
};

const copy = {
  en: {
    eyebrow: "Artist submissions",
    title: "Present your project.",
    intro:
      "Tell us about your music, your identity and what you want to build. Every submission is reviewed individually by the LMG Music team.",
    start: "Start your submission",

    looking: "What we look for",
    lookingTitle: "More than a good track.",
    lookingIntro:
      "We look at the project as a whole: artistic identity, vision, consistency and the ability to build over time.",
    criteria: [
      ["01", "Identity", "A distinctive artistic world and a clear direction."],
      ["02", "Vision", "An understanding of where you want to take your project."],
      ["03", "Consistency", "A real commitment to developing your music over time."],
      ["04", "Professionalism", "The ability to communicate, collaborate and move forward."],
    ],

    process: "How it works",
    processTitle: "A simple process.",
    steps: [
      ["01", "Submission", "Send us the essential information about your project."],
      ["02", "Review", "Our team reviews your music, identity and development."],
      ["03", "Conversation", "If there is a potential fit, we arrange a conversation."],
      ["04", "Next steps", "If we move forward together, we define the right framework."],
    ],

    formEyebrow: "Your project",
    formTitle: "Tell us what you're building.",
    formIntro:
      "Give us enough context to understand your current position, your ambitions and your artistic direction.",

    identity: "01 — Identity",
    artistName: "Artist name *",
    city: "City",
    email: "Email *",
    phone: "Phone",

    project: "02 — Project",
    genre: "Music genre *",
    stage: "Project stage *",
    stages: {
      debut: "Early stage",
      developpement: "In development",
      actif: "Active project",
      structure: "Established project",
    },
    team: "Current team: manager, producer, creative director, label...",

    presence: "03 — Music & presence",
    instagram: "Instagram",
    tiktok: "TikTok",
    spotify: "Spotify",
    musicLink: "Music / YouTube / SoundCloud / Drive link *",

    vision: "04 — Vision",
    objectives: "What are your goals for the next 12 months? *",
    message: "Tell us about your project, your world and what makes it distinctive. *",

    privacy:
      "The information submitted here is used only by LMG Music to review your project.",
    submit: "Submit my project",
    submitting: "Sending...",

    errorTitle: "Unable to send your submission.",
    errorText:
      "Please try again. If the problem continues, you can contact the LMG Music team.",

    successEyebrow: "Submission received",
    successTitle: "Thank you for sharing your project.",
    successText:
      "Our team will review your submission. If we see a potential fit with LMG Music, we'll contact you to continue the conversation.",
    again: "Submit another project",
    contact: "Contact LMG Music",
  },

  fr: {
    eyebrow: "Soumissions artistes",
    title: "Présente ton projet.",
    intro:
      "Parle-nous de ta musique, de ton identité et de ce que tu veux construire. Chaque projet est étudié individuellement par l'équipe LMG Music.",
    start: "Commencer ma candidature",

    looking: "Ce que nous recherchons",
    lookingTitle: "Plus qu'un bon morceau.",
    lookingIntro:
      "Nous regardons le projet dans son ensemble : identité artistique, vision, régularité et capacité à construire dans la durée.",
    criteria: [
      ["01", "Identité", "Un univers artistique identifiable et une direction claire."],
      ["02", "Vision", "Savoir où tu souhaites emmener ton projet."],
      ["03", "Régularité", "Une vraie implication dans le développement de ta musique."],
      ["04", "Professionnalisme", "Savoir communiquer, collaborer et avancer en équipe."],
    ],

    process: "Le processus",
    processTitle: "Un parcours simple.",
    steps: [
      ["01", "Candidature", "Envoie-nous les informations essentielles sur ton projet."],
      ["02", "Étude", "Notre équipe analyse ta musique, ton identité et ton développement."],
      ["03", "Échange", "Si nous identifions un potentiel commun, nous organisons un échange."],
      ["04", "Suite", "Si nous avançons ensemble, nous définissons le cadre adapté."],
    ],

    formEyebrow: "Ton projet",
    formTitle: "Parle-nous de ce que tu construis.",
    formIntro:
      "Donne-nous suffisamment de contexte pour comprendre où tu en es, tes ambitions et ta direction artistique.",

    identity: "01 — Identité",
    artistName: "Nom d'artiste *",
    city: "Ville",
    email: "Email *",
    phone: "Téléphone",

    project: "02 — Projet",
    genre: "Style musical *",
    stage: "Stade du projet *",
    stages: {
      debut: "Début de projet",
      developpement: "En développement",
      actif: "Projet actif",
      structure: "Projet déjà structuré",
    },
    team: "Équipe actuelle : manager, beatmaker, DA, label...",

    presence: "03 — Musique & présence",
    instagram: "Instagram",
    tiktok: "TikTok",
    spotify: "Spotify",
    musicLink: "Lien musique / YouTube / SoundCloud / Drive *",

    vision: "04 — Vision",
    objectives: "Quels sont tes objectifs pour les 12 prochains mois ? *",
    message: "Présente ton projet, ton univers et ce qui te différencie. *",

    privacy:
      "Les informations envoyées sont utilisées uniquement par LMG Music pour étudier ton projet.",
    submit: "Envoyer mon projet",
    submitting: "Envoi...",

    errorTitle: "Impossible d'envoyer ta candidature.",
    errorText:
      "Réessaie dans quelques instants. Si le problème persiste, tu peux contacter l'équipe LMG Music.",

    successEyebrow: "Candidature reçue",
    successTitle: "Merci de nous avoir présenté ton projet.",
    successText:
      "Notre équipe va étudier ta candidature. Si nous identifions une possibilité de collaboration avec LMG Music, nous te contacterons pour poursuivre l'échange.",
    again: "Présenter un autre projet",
    contact: "Contacter LMG Music",
  },
} as const;

export default function RejoindrePage() {
  const { locale } = useSiteLanguage();
  const c = copy[locale];

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState(initialForm);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMessage("");

    const { error } = await supabaseBrowser
      .from("candidatures")
      .insert({
        ...form,
        statut: "nouvelle",
        priorite: "moyenne",
        source: "site_web",
        potentiel: "À qualifier",
        assigned_to: null,
      });

    setLoading(false);

    if (error) {
      console.error("Erreur candidature :", error);
      setErrorMessage(c.errorText);
      return;
    }

    setSuccess(true);
    setForm(initialForm);
  }

  const fieldClass =
    "w-full rounded-xl border border-white/10 bg-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-500/70";

  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10 px-6 pb-20 pt-32 md:px-8 md:pb-24">
        <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-yellow-500/[0.07] blur-[130px]" />

        <div className="relative mx-auto max-w-[1200px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
            {c.eyebrow}
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] md:text-6xl lg:text-7xl">
            {c.title}
          </h1>

          <div className="mt-8 flex max-w-3xl flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <p className="max-w-2xl text-base leading-8 text-white/50 md:text-lg">
              {c.intro}
            </p>

            <a
              href="#submission"
              className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-500"
            >
              {c.start}
            </a>
          </div>
        </div>
      </section>

      {/* WHAT WE LOOK FOR */}
      <section className="border-b border-white/10 px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                {c.looking}
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                {c.lookingTitle}
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/45">
                {c.lookingIntro}
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/10 sm:grid-cols-2">
              {c.criteria.map(([number, title, text]) => (
                <div key={number} className="bg-black p-6 md:p-7">
                  <span className="text-[10px] font-bold text-yellow-500">
                    {number}
                  </span>

                  <h3 className="mt-8 text-xl font-semibold tracking-[-0.02em]">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/40">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-b border-white/10 bg-zinc-950/50 px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
            {c.process}
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
            {c.processTitle}
          </h2>

          <div className="mt-10 grid gap-px overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/10 md:grid-cols-4">
            {c.steps.map(([number, title, text]) => (
              <div key={number} className="bg-black p-6 md:min-h-[245px]">
                <p className="text-sm font-semibold text-yellow-500">
                  {number}
                </p>

                <h3 className="mt-12 text-xl font-semibold tracking-[-0.02em]">
                  {title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/40">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section
        id="submission"
        className="scroll-mt-24 px-6 py-20 md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <div className="lg:sticky lg:top-32">
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                  {c.formEyebrow}
                </p>

                <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                  {c.formTitle}
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/45">
                  {c.formIntro}
                </p>
              </div>
            </div>

            {success ? (
              <div
                className="rounded-[1.5rem] border border-yellow-500/25 bg-zinc-950 p-7 md:p-10"
                aria-live="polite"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500/30 text-yellow-500">
                  ✓
                </div>

                <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                  {c.successEyebrow}
                </p>

                <h3 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                  {c.successTitle}
                </h3>

                <p className="mt-5 max-w-xl text-sm leading-7 text-white/45 md:text-base">
                  {c.successText}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-500"
                  >
                    {c.again}
                  </button>

                  <Link
                    href="/contact"
                    className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/65 transition hover:border-white/40 hover:text-white"
                  >
                    {c.contact}
                  </Link>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-[1.5rem] border border-white/10 bg-zinc-950/60 p-6 md:p-8"
              >
                {/* IDENTITY */}
                <fieldset>
                  <legend className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-500">
                    {c.identity}
                  </legend>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <input
                      required
                      autoComplete="name"
                      placeholder={c.artistName}
                      value={form.nom_artiste}
                      onChange={(e) =>
                        updateField("nom_artiste", e.target.value)
                      }
                      className={fieldClass}
                    />

                    <input
                      autoComplete="address-level2"
                      placeholder={c.city}
                      value={form.ville}
                      onChange={(e) => updateField("ville", e.target.value)}
                      className={fieldClass}
                    />

                    <input
                      required
                      type="email"
                      autoComplete="email"
                      placeholder={c.email}
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={fieldClass}
                    />

                    <input
                      type="tel"
                      autoComplete="tel"
                      placeholder={c.phone}
                      value={form.telephone}
                      onChange={(e) =>
                        updateField("telephone", e.target.value)
                      }
                      className={fieldClass}
                    />
                  </div>
                </fieldset>

                {/* PROJECT */}
                <fieldset className="mt-10 border-t border-white/10 pt-9">
                  <legend className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-500">
                    {c.project}
                  </legend>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <input
                      required
                      placeholder={c.genre}
                      value={form.style_musical}
                      onChange={(e) =>
                        updateField("style_musical", e.target.value)
                      }
                      className={fieldClass}
                    />

                    <select
                      required
                      value={form.stade_projet}
                      onChange={(e) =>
                        updateField("stade_projet", e.target.value)
                      }
                      className={fieldClass}
                    >
                      <option value="">{c.stage}</option>
                      <option value="debut">{c.stages.debut}</option>
                      <option value="developpement">
                        {c.stages.developpement}
                      </option>
                      <option value="actif">{c.stages.actif}</option>
                      <option value="structure">
                        {c.stages.structure}
                      </option>
                    </select>

                    <input
                      placeholder={c.team}
                      value={form.equipe_actuelle}
                      onChange={(e) =>
                        updateField("equipe_actuelle", e.target.value)
                      }
                      className={`${fieldClass} md:col-span-2`}
                    />
                  </div>
                </fieldset>

                {/* PRESENCE */}
                <fieldset className="mt-10 border-t border-white/10 pt-9">
                  <legend className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-500">
                    {c.presence}
                  </legend>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <input
                      placeholder={c.instagram}
                      value={form.instagram}
                      onChange={(e) =>
                        updateField("instagram", e.target.value)
                      }
                      className={fieldClass}
                    />

                    <input
                      placeholder={c.tiktok}
                      value={form.tiktok}
                      onChange={(e) =>
                        updateField("tiktok", e.target.value)
                      }
                      className={fieldClass}
                    />

                    <input
                      placeholder={c.spotify}
                      value={form.spotify}
                      onChange={(e) =>
                        updateField("spotify", e.target.value)
                      }
                      className={fieldClass}
                    />

                    <input
                      required
                      placeholder={c.musicLink}
                      value={form.lien_musique}
                      onChange={(e) =>
                        updateField("lien_musique", e.target.value)
                      }
                      className={fieldClass}
                    />
                  </div>
                </fieldset>

                {/* VISION */}
                <fieldset className="mt-10 border-t border-white/10 pt-9">
                  <legend className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-500">
                    {c.vision}
                  </legend>

                  <div className="mt-6 grid gap-4">
                    <textarea
                      required
                      rows={4}
                      placeholder={c.objectives}
                      value={form.objectifs}
                      onChange={(e) =>
                        updateField("objectifs", e.target.value)
                      }
                      className={`${fieldClass} resize-y`}
                    />

                    <textarea
                      required
                      rows={6}
                      placeholder={c.message}
                      value={form.message}
                      onChange={(e) =>
                        updateField("message", e.target.value)
                      }
                      className={`${fieldClass} resize-y`}
                    />
                  </div>
                </fieldset>

                {errorMessage && (
                  <div
                    className="mt-8 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4"
                    role="alert"
                  >
                    <p className="text-sm font-medium text-red-300">
                      {c.errorTitle}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-red-200/55">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <div className="mt-9 flex flex-col gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-md text-xs leading-6 text-white/30">
                    {c.privacy}
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="shrink-0 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? c.submitting : c.submit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
