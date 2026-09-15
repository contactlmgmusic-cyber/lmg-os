export default function RoleBadge({ role }: { role?: string | null }) {
  const styles: Record<string, string> = {
    super_admin: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    admin: "border-red-500/40 bg-red-500/10 text-red-300",
    manager: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    artistic_director: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    artiste: "border-green-500/40 bg-green-500/10 text-green-300",
    prestataire: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    guest: "border-zinc-700 bg-zinc-800 text-zinc-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        styles[role || "guest"] || styles.guest
      }`}
    >
      {{ super_admin: "Super Admin", admin: "Admin", manager: "Manager", artistic_director: "Directeur artistique", artiste: "Artiste", prestataire: "Prestataire" }[role || ""] || "Rôle inconnu"}
    </span>
  );
}
