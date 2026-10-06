export const MAX_CV_SIZE = 4 * 1024 * 1024;
const departments = new Set(["music", "creative", "business", "tech_digital", "multiple"]);
export function validateApplication(form: FormData) {
  const text = (name: string, max: number, required = false) => {
    const raw = form.get(name);
    if (raw !== null && typeof raw !== "string") throw new Error("Invalid field");
    const value = typeof raw === "string" ? raw.trim() : "";
    if ((required && !value) || value.length > max) throw new Error("Invalid field");
    return value || null;
  };
  const first_name = text("first_name", 100, true), last_name = text("last_name", 100, true);
  const email = text("email", 254, true)!.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
  const application_type = text("application_type", 20) || "job";
  if (!["job", "spontaneous"].includes(application_type)) throw new Error("Invalid application type");
  const job_slug = text("job_slug", 180, application_type === "job");
  if (job_slug && !/^[\p{L}\p{N}_-]+$/u.test(job_slug)) throw new Error("Invalid job");
  const department_interest = text("department_interest", 30, application_type === "spontaneous");
  if (application_type === "spontaneous" && !departments.has(department_interest!)) throw new Error("Invalid department");
  const url = (name: string) => {
    const value = text(name, 2048);
    if (!value) return null;
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error("Invalid URL");
    return parsed.href;
  };
  return { first_name, last_name, email, phone: text("phone", 40), location: text("location", 200),
    linkedin_url: url("linkedin_url"), portfolio_url: url("portfolio_url"), cover_letter: text("cover_letter", 10000),
    availability: text("availability", 500), application_type, job_slug,
    department_interest: application_type === "spontaneous" ? department_interest : null };
}
export async function validateCv(file: File) {
  if (file.size === 0 || file.size > MAX_CV_SIZE) throw new Error("Invalid CV size");
  const bytes = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  const starts = (signature: number[]) => signature.every((value, index) => bytes[index] === value);
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "pdf" && file.type === "application/pdf" && new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-") return "pdf";
  if (extension === "doc" && file.type === "application/msword" && starts([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1])) return "doc";
  if (extension === "docx" && file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && starts([0x50,0x4b,0x03,0x04])) return "docx";
  throw new Error("Invalid CV format");
}
