"use client";

import { FormEvent, useState } from "react";

type Job = {
  title: string;
  slug: string;
  department: string;
  employment_type: string;
  location: string | null;
};

export default function CareersApplyForm({
  job,
}: {
  job: Job;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);

    data.set("job_slug", job.slug);

    try {
      const response = await fetch(
        "/api/careers/applications",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to submit application."
        );
      }

      setSuccess(true);
      form.reset();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="border-t border-[#d5ad58] pt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
          Application received
        </p>

        <h2 className="mt-8 max-w-3xl text-5xl font-medium leading-[0.95] tracking-[-0.055em] md:text-7xl">
          Thank you for making the first move.
        </h2>

        <p className="mt-8 max-w-xl text-sm leading-7 text-white/50">
          Your application for {job.title} has been
          received by the LMG team.
        </p>

        <a
          href="/jobs"
          className="mt-10 inline-flex rounded-full bg-[#d5ad58] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-black"
        >
          Back to opportunities
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-16"
      encType="multipart/form-data"
    >
      <FormSection number="01" title="About you">
        <div className="grid gap-8 md:grid-cols-2">
          <Field
            label="First name"
            name="first_name"
            required
          />

          <Field
            label="Last name"
            name="last_name"
            required
          />

          <Field
            label="Email"
            name="email"
            type="email"
            required
          />

          <Field
            label="Phone"
            name="phone"
            type="tel"
          />

          <Field
            label="Location"
            name="location"
            placeholder="City, country"
          />

          <Field
            label="Availability"
            name="availability"
            placeholder="Immediately, September 2027..."
          />
        </div>
      </FormSection>

      <FormSection number="02" title="Your work">
        <div className="grid gap-8 md:grid-cols-2">
          <Field
            label="LinkedIn"
            name="linkedin_url"
            type="url"
            placeholder="https://"
          />

          <Field
            label="Portfolio / website"
            name="portfolio_url"
            type="url"
            placeholder="https://"
          />
        </div>
      </FormSection>

      <FormSection number="03" title="Your CV">
        <div>
          <label className="block">
            <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
              CV *
            </span>

            <input
              name="cv"
              type="file"
              required
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="block w-full border border-white/15 bg-transparent px-5 py-5 text-sm text-white file:mr-5 file:rounded-full file:border-0 file:bg-[#d5ad58] file:px-5 file:py-3 file:text-[9px] file:font-bold file:uppercase file:tracking-[0.15em] file:text-black"
            />

            <span className="mt-3 block text-xs text-white/30">
              PDF, DOC or DOCX · 10 MB maximum
            </span>
          </label>
        </div>
      </FormSection>

      <FormSection number="04" title="Why this role?">
        <label className="block">
          <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            Tell us more
          </span>

          <textarea
            name="cover_letter"
            rows={8}
            placeholder="Tell us what brings you here, what you've built and what you'd like to bring to LMG."
            className="w-full resize-none border border-white/15 bg-transparent px-5 py-5 text-sm leading-7 text-white outline-none transition placeholder:text-white/20 focus:border-[#d5ad58]"
          />
        </label>
      </FormSection>

      {error && (
        <div className="border border-red-400/30 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 border-t border-white/15 pt-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl text-xs leading-6 text-white/35">
          By submitting your application, you confirm that
          the information provided is accurate and may be
          reviewed by the LMG team for recruitment purposes.
        </p>


        <p className="max-w-2xl text-xs leading-5 text-white/40">
          By submitting your application, you acknowledge that LMG
          will process the information you provide for recruitment
          purposes. Learn more about how we handle candidate data in
          our{" "}
          <a
            href="/privacy"
            className="text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
          >
            Candidate Privacy Notice
          </a>.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-w-[190px] items-center justify-center rounded-full bg-[#d5ad58] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting
            ? "Sending..."
            : "Submit application"}
        </button>
      </div>
    </form>
  );
}

function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-7 border-t border-white/15 pt-8 md:grid-cols-[80px_1fr]">
      <span className="text-[10px] text-[#d5ad58]">
        {number}
      </span>

      <div>
        <h2 className="mb-10 text-3xl font-medium tracking-[-0.045em] md:text-4xl">
          {title}
        </h2>

        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
        {label}
        {required ? " *" : ""}
      </span>

      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border-0 border-b border-white/20 bg-transparent px-0 py-4 text-base text-white outline-none transition placeholder:text-white/20 focus:border-[#d5ad58]"
      />
    </label>
  );
}
