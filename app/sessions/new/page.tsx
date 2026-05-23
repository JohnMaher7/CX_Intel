import { Layers, Quote, Brain, FlaskConical } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { IngestForm } from "@/components/ingest-form";

export const metadata = {
  title: "Ingest a discovery session",
};

const steps: Array<{
  title: string;
  description: string;
  icon: typeof Layers;
}> = [
  {
    title: "Workflow extraction",
    description:
      "Stages in order, derived from speaker turns and verb cues.",
    icon: Layers,
  },
  {
    title: "Bottleneck extraction",
    description: "Each pain point captured with a verbatim evidence quote.",
    icon: Quote,
  },
  {
    title: "Clarifying check",
    description:
      "If the transcript is thin, the system pauses to ask a few questions.",
    icon: Brain,
  },
  {
    title: "Scoring",
    description:
      "AI-solvable items run rubric v1: impact · feasibility · cost.",
    icon: FlaskConical,
  },
];

export default function NewSessionPage() {
  return (
    <>
      <Topbar
        title="Start a new session"
        subtitle="Ingest a discovery transcript. The pipeline extracts the workflow, finds bottlenecks, flags AI-solvable ones, and scores them. ~30–60 seconds end-to-end."
      />

      <div className="grid flex-1 grid-cols-1 gap-4 px-7 pb-6 pt-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section
          className="rounded-[12px] border bg-card p-[22px]"
          style={{ borderColor: "var(--rule)" }}
        >
          <IngestForm />
        </section>

        <aside
          className="rounded-[12px] border bg-card p-[22px]"
          style={{ borderColor: "var(--rule)" }}
        >
          <h2
            className="font-editorial mb-3 text-[22px] font-normal"
            style={{ color: "var(--ink)" }}
          >
            How the pipeline reads it
          </h2>
          <ol className="m-0 flex list-none flex-col gap-3.5 p-0">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex gap-3">
                  <div
                    className="grid h-[30px] w-[30px] flex-shrink-0 place-items-center rounded-[9px]"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent-ink)",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div
                      className="text-[13.5px] font-medium"
                      style={{ color: "var(--ink)" }}
                    >
                      {i + 1}. {step.title}
                    </div>
                    <p
                      className="mt-0.5 text-[12.5px] leading-relaxed"
                      style={{ color: "var(--muted)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div
            className="mt-[18px] rounded-[10px] border p-3.5"
            style={{
              background: "var(--panel-2)",
              borderColor: "var(--rule)",
            }}
          >
            <div className="text-[12px]" style={{ color: "var(--muted)" }}>
              Tip
            </div>
            <p
              className="mt-1 text-[13px] leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              Speaker labels matter. The richer the labels (role, team), the
              better the workflow extraction.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
