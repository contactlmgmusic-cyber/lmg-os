"use client";

import { FormEvent, useState } from "react";

import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";

const translations = {
  en: {
    error: "Unable to submit your application.",
    received: "Application received",
    thanks: "Thanks for making the first move.",
    success:
      "Your profile is now with the LMG team. We'll get in touch if an opportunity matches what you can bring.",
    firstName: "First name *",
    lastName: "Last name *",
    email: "Email *",
    phone: "Phone",
    location: "Location",
    locationPlaceholder: "City, country",
    availability: "Availability",
    availabilityPlaceholder: "Now, September 2027...",
    impact: "Where could you make an impact? *",
    select: "Select an area",
    music: "Music",
    creative: "Creative",
    business: "Business",
    tech: "Tech & Digital",
    multiple: "Across several areas",
    portfolio: "Portfolio / website",
    cv: "CV *",
    cvHelp: "PDF, DOC or DOCX — maximum 10 MB.",
    build: "Tell us what you want to build",
    buildPlaceholder:
      "Tell us about your perspective, your work and where you think you could contribute at LMG.",
    privacy:
      "By submitting your application, you acknowledge that LMG will process the information you provide for recruitment purposes. Learn more about how we handle candidate data in our",
    privacyLink: "Candidate Privacy Notice",
    sending: "Sending...",
    submit: "Introduce yourself",
  },

  fr: {
    error: "Impossible d’envoyer votre candidature. Veuillez réessayer.",
    received: "Candidature reçue",
    thanks: "Merci d’avoir fait le premier pas.",
    success:
      "Votre profil a bien été transmis à l’équipe LMG. Nous vous contacterons si une opportunité correspond à ce que vous pouvez apporter.",
    firstName: "Prénom *",
    lastName: "Nom *",
    email: "E-mail *",
    phone: "Téléphone",
    location: "Localisation",
    locationPlaceholder: "Ville, pays",
    availability: "Disponibilité",
    availabilityPlaceholder: "Maintenant, septembre 2027...",
    impact: "Où pourriez-vous avoir un impact ? *",
    select: "Sélectionnez un domaine",
    music: "Musique",
    creative: "Créatif",
    business: "Business",
    tech: "Tech & Digital",
    multiple: "Plusieurs domaines",
    portfolio: "Portfolio / site web",
    cv: "CV *",
    cvHelp: "PDF, DOC ou DOCX — 10 Mo maximum.",
    build: "Dites-nous ce que vous voulez construire",
    buildPlaceholder:
      "Parlez-nous de votre vision, de votre travail et de la manière dont vous pourriez contribuer à LMG.",
    privacy:
      "En envoyant votre candidature, vous reconnaissez que LMG traitera les informations fournies à des fins de recrutement. Découvrez comment nous traitons les données des candidats dans notre",
    privacyLink: "Politique de confidentialité des candidats",
    sending: "Envoi...",
    submit: "Présentez-vous",
  },
} as const;

export default function CareersSpontaneousForm() {
  const { locale } = useCareersLanguage();
  const t = translations[locale];

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSending(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.set("application_type", "spontaneous");

    try {
      const response = await fetch(
        "/api/careers/applications",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          locale === "fr"
            ? t.error
            : result.error || t.error
        );
      }

      setSuccess(true);
      form.reset();
    } catch (err) {
      setError(
        locale === "fr"
          ? t.error
          : err instanceof Error
            ? err.message
            : t.error
      );
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className="border-t border-white/20 pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d5ad58]">
          {t.received}
        </p>

        <h2 className="mt-5 max-w-2xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.05em] md:text-6xl">
          {t.thanks}
        </h2>

        <p className="mt-6 max-w-xl text-base leading-7 text-white/60">
          {t.success}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-x-6 gap-y-7 md:grid-cols-2"
    >
      <Field label={t.firstName}>
        <input
          name="first_name"
          required
          className={inputClass}
        />
      </Field>

      <Field label={t.lastName}>
        <input
          name="last_name"
          required
          className={inputClass}
        />
      </Field>

      <Field label={t.email}>
        <input
          type="email"
          name="email"
          required
          className={inputClass}
        />
      </Field>

      <Field label={t.phone}>
        <input
          name="phone"
          className={inputClass}
        />
      </Field>

      <Field label={t.location}>
        <input
          name="location"
          placeholder={t.locationPlaceholder}
          className={inputClass}
        />
      </Field>

      <Field label={t.availability}>
        <input
          name="availability"
          placeholder={t.availabilityPlaceholder}
          className={inputClass}
        />
      </Field>

      <div className="md:col-span-2">
        <Field label={t.impact}>
          <select
            name="department_interest"
            required
            className={inputClass}
            defaultValue=""
          >
            <option value="" disabled>
              {t.select}
            </option>
            <option value="music">{t.music}</option>
            <option value="creative">{t.creative}</option>
            <option value="business">{t.business}</option>
            <option value="tech_digital">{t.tech}</option>
            <option value="multiple">{t.multiple}</option>
          </select>
        </Field>
      </div>

      <Field label="LinkedIn">
        <input
          type="url"
          name="linkedin_url"
          placeholder="https://..."
          className={inputClass}
        />
      </Field>

      <Field label={t.portfolio}>
        <input
          type="url"
          name="portfolio_url"
          placeholder="https://..."
          className={inputClass}
        />
      </Field>

      <div className="md:col-span-2">
        <Field label={t.cv}>
          <input
            type="file"
            name="cv"
            required
            accept=".pdf,.doc,.docx"
            className="block w-full border-b border-white/25 bg-transparent py-4 text-sm text-white file:mr-5 file:rounded-full file:border-0 file:bg-[#d5ad58] file:px-5 file:py-2.5 file:text-xs file:font-bold file:uppercase file:tracking-[0.12em] file:text-black"
          />

          <p className="mt-2 text-xs text-white/40">
            {t.cvHelp}
          </p>
        </Field>
      </div>

      <div className="md:col-span-2">
        <Field label={t.build}>
          <textarea
            name="cover_letter"
            rows={7}
            placeholder={t.buildPlaceholder}
            className={`${inputClass} resize-none`}
          />
        </Field>
      </div>

      {error && (
        <div className="md:col-span-2">
          <p className="text-sm text-red-400">
            {error}
          </p>
        </div>
      )}

      <div className="border-t border-white/20 pt-7 md:col-span-2">
        <p className="max-w-2xl text-xs leading-5 text-white/40">
          {t.privacy}{" "}
          <a
            href="/privacy"
            className="text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
          >
            {t.privacyLink}
          </a>.
        </p>

        <button
          type="submit"
          disabled={sending}
          className="mt-7 rounded-full bg-[#d5ad58] px-8 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:opacity-50"
        >
          {sending ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full border-0 border-b border-white/25 bg-transparent px-0 py-4 text-base text-white outline-none transition placeholder:text-white/30 focus:border-[#d5ad58] focus:ring-0";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
        {label}
      </span>

      <div className="mt-1">{children}</div>
    </label>
  );
}
