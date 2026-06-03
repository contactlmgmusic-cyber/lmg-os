type ActivityLog = {
  id: string;
  type: string;
  message: string;
  created_at: string;
  profiles?: {
    nom: string | null;
    full_name?: string | null;
    avatar_url: string | null;
  } | null;
};

export default function TaskActivity({
  logs,
}: {
  logs: ActivityLog[];
}) {
  return (
    <div className="mt-8 rounded-2xl bg-black p-6">
      <h2 className="mb-4 text-2xl font-bold">Activité</h2>

      <div className="space-y-4">
        {logs.length === 0 && (
          <p className="text-sm text-zinc-500">
            Aucune activité pour le moment.
          </p>
        )}

        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <p className="text-sm text-white">{log.message}</p>

            <p className="mt-2 text-xs text-zinc-500">
              {log.profiles?.nom ||
                log.profiles?.full_name ||
                "Utilisateur"}{" "}
              · {log.type} ·{" "}
              {new Date(log.created_at).toLocaleString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}