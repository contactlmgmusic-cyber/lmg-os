type WorkflowStep = {
  id: string;
  title: string;
  status: "pending" | "done" | "failed";
};

type Workflow = {
  title: string;
  steps: WorkflowStep[];
};

export default function AssistantWorkflowCard({
  workflow,
  onExecuteAll,
}: {
  workflow: Workflow;
  onExecuteAll?: () => void;
}) {
  const done = workflow.steps.filter(
    (step) => step.status === "done"
  ).length;

  const progress =
    workflow.steps.length === 0
      ? 0
      : Math.round((done / workflow.steps.length) * 100);

  return (
    <div className="mb-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Workflow
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            {workflow.title}
          </h3>
        </div>

        <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm">
          {progress}%
        </span>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-black">
        <div
          className="h-full rounded-full bg-white transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="mt-6 space-y-3">
        {workflow.steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center justify-between rounded-xl border border-zinc-800 p-4"
          >
            <span>{step.title}</span>

            <span>
              {step.status === "done"
                ? "✅"
                : step.status === "failed"
                ? "❌"
                : "⏳"}
            </span>
          </div>
        ))}
      </div>

      {onExecuteAll && (
        <button
          type="button"
          onClick={onExecuteAll}
          className="mt-6 w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black"
        >
          Exécuter tout
        </button>
      )}
    </div>
  );
}