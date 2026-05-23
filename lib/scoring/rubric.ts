/**
 * RUBRIC_V1 — versioned scoring rubric for AI opportunities.
 *
 * The rubric is code, not a buried prompt. Every Score persisted alongside
 * an Opportunity records the `version` string below, so when this file
 * changes we can tell which scores were produced against which rubric.
 *
 * Convention: every dimension is scored 1 (worst) → 5 (best) including
 * `cost`. The anchors below already encode "5 = cheapest" for cost, so the
 * composite is a uniform weighted average — we do NOT invert at compute
 * time. Avoiding the inversion step keeps the maths legible end-to-end.
 *
 * Anchors are intentionally long and specific. They are injected verbatim
 * into the scoring prompt and become the model's calibration. Vague
 * anchors → vague scores. See notes/versioning-rubrics.md.
 */

export const RUBRIC_V1 = {
  version: "v1.0",
  dimensions: {
    impact: {
      weight: 0.45,
      sub_criteria: ["volume", "hours_saved", "customer_friction"] as const,
      description:
        "Size of the prize if the AI solution works. Combines how often the bottleneck fires, how much human time it consumes, and how badly it hurts the customer experience.",
      anchors: {
        1: "Negligible. Bottleneck affects a handful of cases per quarter, costs less than an hour of human time per week, and customers do not notice or complain.",
        2: "Minor. Bottleneck affects a small slice of volume (single-digit % of tickets, accounts, or sessions). A few agent-hours per week, mild customer annoyance.",
        3: "Material. Bottleneck affects a meaningful slice of volume (10–25%). Tens of agent-hours per week or a recurring source of escalations and customer complaints.",
        4: "Major. Bottleneck affects a large slice of volume (25–50%) or 50+ agent-hours per week. Customers describe it as painful; it appears in retention or NPS conversations.",
        5: "Critical. Bottleneck affects the majority of volume (>50%) or hundreds of agent-hours per week. Directly tied to churn, SLA misses, or escalations to leadership.",
      },
    },
    feasibility: {
      weight: 0.35,
      sub_criteria: [
        "data_availability",
        "llm_capability",
        "process_stability",
      ] as const,
      description:
        "How tractable is the AI solution today. Combines whether the inputs the model needs already exist in clean form, whether current LLMs can do the task reliably, and whether the surrounding human process is stable enough to integrate AI into.",
      anchors: {
        1: "Not feasible now. Required data does not exist or is locked away, the task exceeds current LLM capability (long-horizon agentic work, deep tool use across systems), or the surrounding process changes monthly. Would need a multi-quarter foundation project first.",
        2: "Difficult. Data exists but needs significant cleanup or new instrumentation. Task is at the edge of LLM capability (complex multi-step reasoning, brittle classification). Process is in flux. Real risk of building something that doesn't ship.",
        3: "Possible with effort. Most inputs available, task is within LLM capability with a careful prompt and schema, process is stable but undocumented. Standard discovery + build cycle.",
        4: "Straightforward. Inputs are already in the system in usable form. Task is a textbook LLM strength (classification, extraction, summarisation, drafting). Process is documented and stable. Build is mostly integration work.",
        5: "Slam dunk. Inputs are in clean structured form, the task is one LLMs do reliably with a simple prompt (extract, classify, route, summarise), and the process is mature and well-instrumented. Could be in production in weeks.",
      },
    },
    cost: {
      weight: 0.2,
      sub_criteria: [
        "dev_effort",
        "api_cost",
        "maintenance_burden",
      ] as const,
      description:
        "Total cost of ownership. Combines engineering build effort, ongoing LLM/API spend at expected volume, and the team's burden to keep the system honest (eval, retraining prompts, handling drift). Scored 1=most expensive, 5=cheapest so it composes with the other dimensions.",
      anchors: {
        1: "Very expensive. Multi-quarter build (5+ engineers), heavy ongoing API spend ($10k+/mo) at expected volume, or requires a dedicated ops function to keep working. Likely a strategic platform investment, not a quick win.",
        2: "Expensive. Quarter-plus build, several thousand dollars per month in API spend, regular prompt and eval maintenance from a named owner. Significant commitment.",
        3: "Moderate. Several weeks of engineering, hundreds of dollars per month in API spend, occasional prompt updates as the underlying process evolves.",
        4: "Cheap. A week or two of engineering, low API spend (<$200/mo), maintenance is occasional prompt tweaks. Easy to justify the spend.",
        5: "Very cheap. A few days of engineering, negligible API spend, essentially zero ongoing maintenance once the prompt is tuned. The 'why aren't we just doing this' tier.",
      },
    },
  },
} as const;

export type RubricV1 = typeof RUBRIC_V1;
export type DimensionName = keyof typeof RUBRIC_V1.dimensions;
