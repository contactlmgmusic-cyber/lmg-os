import AssistantGenerator from "@/components/AssistantGenerator";

export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG AI
        </p>

        <h1 className="text-5xl font-bold">
          Assistant Label
        </h1>

        <p className="mt-3 text-zinc-400">
          Génère des idées de rollout, captions, stratégies et tâches pour tes artistes.
        </p>
      </div>

      <AssistantGenerator />
    </main>
  );
}