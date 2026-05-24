export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG AI
        </p>

        <h1 className="text-5xl font-bold">Assistant Label</h1>

        <p className="mt-3 text-zinc-400">
          Génère des idées de rollout, captions, stratégies et tâches pour tes artistes.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="text-2xl font-bold">V1 prête</h2>

        <p className="mt-3 text-zinc-400">
          Prochaine étape : connecter un vrai formulaire pour générer des plans de sortie automatiquement.
        </p>
      </div>
    </main>
  );
}