type AssistantPlan = {
  summary: string;
  recommendations: string[];
  estimatedTime: string;
};

export default function AssistantPlanCard({
  plan,
}: {
  plan: AssistantPlan;
}) {
  return (
    <div className="mb-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            LMG Copilot
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            Analyse terminée
          </h3>
        </div>

        <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-400">
          ✓ Prêt
        </span>
      </div>

      <p className="text-zinc-300">
        {plan.summary}
      </p>

      <div className="mt-6 rounded-2xl bg-black p-5">
        <p className="mb-3 font-semibold">
          Recommandations
        </p>

        <div className="space-y-2">
          {plan.recommendations.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3"
            >
              <span className="text-green-400">
                ✓
              </span>

              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-zinc-500">
          Temps estimé
        </span>

        <span className="font-semibold">
          {plan.estimatedTime}
        </span>
      </div>
    </div>
  );
}