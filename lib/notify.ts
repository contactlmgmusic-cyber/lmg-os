import { supabaseBrowser } from "@/lib/supabase-browser";

export async function notifyRoles({
  roles,
  type,
  titre,
  description,
  link,
}: {
  roles: string[];
  type: string;
  titre: string;
  description?: string;
  link?: string;
}) {
  const { data: users, error } = await supabaseBrowser
    .from("profiles")
    .select("id")
    .in("role", roles);

  if (error || !users || users.length === 0) {
    return;
  }

  const { error: insertError } = await supabaseBrowser.from("notifications").insert(
  users.map((user) => ({
    user_id: user.id,
    type,
    titre,
    description: description || null,
    lien: link || null,
    lu: false,
  }))
);

if (insertError) {
  console.error("NOTIFICATION INSERT ERROR =", insertError);
  alert(insertError.message);
}
}

export async function notifyUser({
  userId,
  type,
  titre,
  description,
  link,
}: {
  userId: string;
  type: string;
  titre: string;
  description?: string;
  link?: string;
}) {
  await supabaseBrowser.from("notifications").insert({
  user_id: userId,
  type,
  titre,
  description: description || null,
  link: link || null,
  lu: false,
});
}