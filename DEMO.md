# Demo runbook — 3 minutes

The narrative arc is **problem → ingest → score → brief**. Three minutes, four screens, one deterministic re-run claim. Anything more is noise.

## Before you start

- `pnpm install && pnpm seed && pnpm dev` (and run `pnpm verify` to confirm it passes today).
- Ingest at least one seeded session ahead of time so the dashboard is not empty when you open it. Leave one fresh transcript in your clipboard for the live ingest step.
- Have these tabs open: `/`, the editor on `lib/scoring/rubric.ts`, the editor on `notes/`.
- Close DevTools. Close anything else.

## The script

### 00:00 — 00:20 · The product

Open `/`.

> "This is the AI opportunity backlog for the CX team. Every row is a bottleneck we extracted from real discovery notes, scored deterministically against a rubric, and ranked by composite impact. The point is to take the most senior CX person's gut feel — 'we should automate triage' — and turn it into a backlog the team can actually argue about."

### 00:20 — 00:50 · The brief + score

Click the top-ranked opportunity.

> "Left pane is a one-page exec brief — Problem, Solution, Feasibility. Generated lazily the first time someone opens the opportunity, then cached to disk. Right pane is the score breakdown."
>
> Point at one sub-score with a `data_availability: 3` or similar. "Every sub-score cites a verbatim quote from the transcript — this one is literally text from the interview. That stops scores from being vibes."

### 00:50 — 01:30 · Ingest a fresh transcript

Navigate to `/sessions/new`. Paste the transcript from your clipboard. Submit.

> "This kicks off four sequential Claude passes. First, a workflow map of the process the speakers described. Second, bottleneck extraction — each one tied to a verbatim quote. Third, a clarifying-questions gate — if the transcript is too thin, the pipeline pauses and asks for context instead of guessing. Fourth, per-opportunity scoring at `temperature: 0` against the rubric."
>
> While it runs, mention: "Each pass has its own Zod schema. The model returns structured JSON; we never parse free text."

### 01:30 — 02:00 · The result

Land on the new session page. Bottlenecks are listed with stages and quotes. Click back to `/`.

> "The new opportunities are now ranked among the rest. Same rubric, same weights — they sort against the seeded ones automatically."

### 02:00 — 02:30 · The rubric is code

Open `lib/scoring/rubric.ts` in the editor.

> "Weights live in code, versioned. Sub-criteria, anchors, the weighting — all here. Scoring is reproducible — `pnpm verify` runs the same opportunity three times and asserts identical composites. If we change the rubric, we bump the version, and every score on disk records which rubric produced it. The composite is computed in TypeScript from the model's sub-scores, not by the LLM — keeps the maths auditable."

### 02:30 — 03:00 · How it was built

Open `notes/`.

> "The whole project was built in stages with Claude Code. Each stage shipped one slice — domain types, AI engine, scoring, UI, drill-down — and is paired with concept notes I wrote to learn the bits I hadn't done before. It's a deliberately small surface so I can show every line."

## Things to NOT click on during the demo

- The sidebar or any nav element that isn't part of the script.
- The clarifying-questions callout (unless the fresh transcript hits it — then it's the demo).
- Anything under `data/` in the file tree. The flat JSON is a feature, not a slide.

## If something goes wrong

| Symptom                                          | Recovery                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| Ingest is slow                                   | Keep talking about the four passes; the live narration covers the wait. |
| Clarifying-questions gate fires on the fresh ingest | Lean into it — "this is the pipeline refusing to guess." Answer one question, resubmit. |
| Brief is blank                                   | The cached file is missing. Click another opportunity; the demo's premise still holds. |
| Score breakdown disagrees with last rehearsal    | Mention `pnpm verify` and move on — the determinism claim is about a single opportunity, not across rubric changes. |
