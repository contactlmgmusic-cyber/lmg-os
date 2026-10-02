import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_CV_SIZE = 10 * 1024 * 1024;

const allowedCvTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedDepartments = new Set([
  "music",
  "creative",
  "business",
  "tech_digital",
  "multiple",
]);

function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function clean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed || null;
}

function safeFilename(filename: string) {
  const extension = filename.includes(".")
    ? `.${filename.split(".").pop()?.toLowerCase()}`
    : "";

  return `cv${extension}`;
}

export async function POST(request: Request) {
  const supabase = createPublicClient();

  try {
    const formData = await request.formData();

    const firstName = clean(formData.get("first_name"));
    const lastName = clean(formData.get("last_name"));
    const email = clean(formData.get("email"));
    const phone = clean(formData.get("phone"));
    const location = clean(formData.get("location"));
    const linkedinUrl = clean(formData.get("linkedin_url"));
    const portfolioUrl = clean(formData.get("portfolio_url"));
    const coverLetter = clean(formData.get("cover_letter"));
    const availability = clean(formData.get("availability"));
    const jobSlug = clean(formData.get("job_slug"));
    const departmentInterest = clean(
      formData.get("department_interest")
    );

    const applicationType =
      clean(formData.get("application_type")) === "spontaneous"
        ? "spontaneous"
        : "job";

    const cv = formData.get("cv");

    /*
     * Champs communs aux deux types de candidature.
     */
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        {
          error:
            "First name, last name and email are required.",
        },
        { status: 400 }
      );
    }

    /*
     * Une candidature liée à une offre doit avoir un job_slug.
     */
    if (applicationType === "job" && !jobSlug) {
      return NextResponse.json(
        {
          error: "A job is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Une candidature spontanée doit préciser un univers.
     */
    if (
      applicationType === "spontaneous" &&
      (!departmentInterest ||
        !allowedDepartments.has(departmentInterest))
    ) {
      return NextResponse.json(
        {
          error: "Please select an area of interest.",
        },
        { status: 400 }
      );
    }

    if (!(cv instanceof File) || cv.size === 0) {
      return NextResponse.json(
        { error: "A CV is required." },
        { status: 400 }
      );
    }

    if (cv.size > MAX_CV_SIZE) {
      return NextResponse.json(
        { error: "The CV must be 10 MB or less." },
        { status: 400 }
      );
    }

    if (!allowedCvTypes.has(cv.type)) {
      return NextResponse.json(
        {
          error:
            "The CV must be a PDF, DOC or DOCX file.",
        },
        { status: 400 }
      );
    }

    /*
     * On ne recherche une offre que pour une candidature
     * envoyée depuis une fiche de poste.
     */
    let jobId: string | null = null;

    if (applicationType === "job") {
      const { data: job, error: jobError } =
        await supabase
          .from("careers_jobs")
          .select("id, slug, status")
          .eq("slug", jobSlug as string)
          .eq("status", "published")
          .maybeSingle();

      if (jobError || !job) {
        return NextResponse.json(
          {
            error:
              "This opportunity is no longer available.",
          },
          { status: 404 }
        );
      }

      jobId = job.id;
    }

    /*
     * Upload privé du CV.
     */
    const folder = crypto.randomUUID();
    const cvPath =
      `applications/${folder}/${safeFilename(cv.name)}`;

    const { error: uploadError } =
      await supabase.storage
        .from("careers-cv")
        .upload(cvPath, cv, {
          contentType: cv.type,
          upsert: false,
        });

    if (uploadError) {
      console.error(uploadError);

      return NextResponse.json(
        {
          error:
            `CV upload failed: ${uploadError.message}`,
        },
        { status: 500 }
      );
    }

    /*
     * Enregistrement de la candidature.
     *
     * JOB:
     * job_id = offre
     * department_interest = null
     *
     * SPONTANEOUS:
     * job_id = null
     * department_interest = choix candidat
     */
    const { error: applicationError } =
      await supabase
        .from("careers_applications")
        .insert({
          job_id: jobId,
          application_type: applicationType,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          location,
          linkedin_url: linkedinUrl,
          portfolio_url: portfolioUrl,
          cv_url: cvPath,
          cover_letter: coverLetter,
          department_interest:
            applicationType === "spontaneous"
              ? departmentInterest
              : null,
          availability,
          status: "new",
          internal_notes: null,
        });

    if (applicationError) {
      console.error(applicationError);

      await supabase.storage
        .from("careers-cv")
        .remove([cvPath]);

      return NextResponse.json(
        {
          error:
            `Application failed: ${applicationError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      applicationType,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to submit your application.",
      },
      { status: 500 }
    );
  }
}
