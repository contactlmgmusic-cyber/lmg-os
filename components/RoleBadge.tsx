export default function RoleBadge({ role }: { role?: string | null }) {
  const styles: Record<string, string> = {
    admin: "border-red-500/40 bg-red-500/10 text-red-300",
    manager: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    member: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    artist: "border-green-500/40 bg-green-500/10 text-green-300",
    guest: "border-zinc-700 bg-zinc-800 text-zinc-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        styles[role || "guest"] || styles.guest
      }`}
    >
      {role || "guest"}
    </span>
  );
}