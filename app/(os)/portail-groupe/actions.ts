"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/require-role.server";
import { EXECUTIVE_ROLES } from "@/lib/roles";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { validateEntry, type PortalEntry } from "@/lib/portal/content";
export async function savePortalEntry(entry: PortalEntry) {
  await requireRole(EXECUTIVE_ROLES);
  try {
    if (!["news", "project"].includes(entry.kind) || !["draft", "published"].includes(entry.status)) throw new Error("Type de contenu invalide.");
    const data = validateEntry(entry.kind, entry.slug, entry.data);
    if (entry.kind === "news" && entry.status === "published" && String(data.publishedAt) > new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date())) throw new Error("La publication programmée n’est pas disponible : choisissez une date passée ou aujourd’hui.");
    if (entry.kind === "project" && String(data.image).startsWith("https://")) {
      const image = new URL(String(data.image));
      const allowed = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
      if (image.origin !== allowed.origin || !image.pathname.startsWith("/storage/v1/object/public/portal-media/")) throw new Error("Utilisez un visuel importé dans la médiathèque du portail.");
    }
    const supabase = await createAuthenticatedSupabaseClient();
    const payload = { kind: entry.kind, slug: entry.slug, status: entry.status, data };
    let result;
    if (entry.id) {
      result = await supabase.from("portal_content").update(payload).eq("id", entry.id).eq("updated_at", entry.updated_at).select("*").maybeSingle();
    } else {
      result = await supabase.from("portal_content").insert(payload).select("*").single();
    }
    if (result.error) throw new Error(result.error.code === "23505" ? "Cette adresse est déjà utilisée." : "Enregistrement impossible. Vérifiez la connexion et les permissions Supabase.");
    if (!result.data) throw new Error("Ce contenu a été modifié entre-temps. Rechargez la page avant de réessayer.");
    revalidatePath("/portail-groupe");
    return { entry: result.data as PortalEntry, error: null };
  } catch (error) { return { entry: null, error: error instanceof Error ? error.message : "Une erreur est survenue." }; }
}
