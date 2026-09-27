export type PortalKind = "news" | "project";
export type PortalData = Record<string, string | { title: string; text: string }[]>;
export type PortalEntry = { id: string; kind: PortalKind; slug: string; status: "draft" | "published"; data: PortalData; updated_at: string };
export const fields = {
  news: [["title", "Titre"], ["intro", "Introduction"], ["category", "Catégorie"], ["publishedAt", "Date de publication"]],
  project: [["title", "Titre"], ["intro", "Introduction"], ["division", "Pôle"], ["category", "Catégorie"], ["image", "URL du visuel"], ["alt", "Description du visuel"], ["heading", "Titre de présentation"], ["body", "Présentation du projet"], ["context", "Univers"], ["focus", "Focus"], ["href", "Lien externe"], ["linkLabel", "Libellé du lien"]],
} as const;
export function validateEntry(kind: PortalKind, slug: string, raw: PortalData): PortalData {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) throw new Error("L’adresse doit contenir des lettres minuscules, chiffres et tirets uniquement.");
  const data: PortalData = {};
  for (const [key, label] of fields[kind]) {
    const value = raw[key];
    if (typeof value !== "string" || !value.trim() || value.length > (key === "body" ? 20000 : 3000)) throw new Error(`Vérifiez le champ « ${label} ».`);
    data[key] = value.trim();
  }
  if (kind === "project") {
    if (!["Music", "Entertainment", "Agency"].includes(String(data.division))) throw new Error("Choisissez un pôle valide.");
    const image = String(data.image);
    if (!(image.startsWith("/images/") && !image.includes("..") && !image.includes("\\")) && !isHttps(image)) throw new Error("Le visuel doit être une URL HTTPS ou un fichier /images/ du portail.");
    if (!isHttps(String(data.href))) throw new Error("Le lien externe doit commencer par https://.");
  } else {
    const date = String(data.publishedAt);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) throw new Error("La date de publication est invalide.");
  }
  {
    const blocks = raw.sections ?? [];
    if (!Array.isArray(blocks) || blocks.length < (kind === "news" ? 1 : 0) || blocks.length > 20) throw new Error("Ajoutez entre 1 et 20 paragraphes.");
    data.sections = blocks.map(section => {
      if (!section || typeof section.title !== "string" || typeof section.text !== "string" || !section.title.trim() || !section.text.trim() || section.title.length > 300 || section.text.length > 20000) throw new Error("Chaque paragraphe doit avoir un titre et un texte.");
      return { title: section.title.trim(), text: section.text.trim() };
    });
  }
  return data;
}
function isHttps(value: string) { try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; } }
