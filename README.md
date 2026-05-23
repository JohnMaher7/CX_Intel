# CX Process Intelligence

A small Next.js app that turns raw CX discovery notes into a ranked, evidence-backed AI-opportunity backlog. Paste a transcript → the pipeline maps the workflow, extracts bottlenecks, scores each one against a versioned rubric, and surfaces the highest-impact opportunities with one-page exec briefs.

## What this is, in 5 bullets

- **Input**: a discovery-call transcript pasted into the UI (or seeded from `data/seed/`).
- **Pipeline**: four sequential Claude passes — workflow map → bottleneck extraction with verbatim evidence → clarifying-questions gate → per-opportunity scoring at `temperature: 0`.
- **Scoring**: deterministic. Sub-scores come from the model with a quote from the transcript; the weighted composite is computed in TypeScript against [`RUBRIC_V1`](lib/scoring/rubric.ts). `pnpm verify` re-runs the same opportunity 3× and asserts identical composites.
- **Output**: a ranked dashboard at `/`, per-session detail pages, and per-opportunity drill-downs with a lazily-generated executive brief cached on disk.
- **Storage**: flat JSON under `./data/`. No database, no migrations.

## Setup

Prereqs: Node 20+ and `pnpm` (`npm i -g pnpm`).

```bash
pnpm install
```

Create `.env.local` at the repo root with your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Seed the three example transcripts and start the dev server:

```bash
pnpm seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard will be empty until you ingest a session (the seeded transcripts have raw text but no analysis yet — open one and use the ingest UI, or paste a fresh transcript at `/sessions/new`).

## Useful scripts

| Command           | Purpose                                                              |
| ----------------- | -------------------------------------------------------------------- |
| `pnpm dev`        | Start the Next.js dev server.                                        |
| `pnpm build`      | Production build.                                                    |
| `pnpm seed`       | Load `data/seed/*.md` into `data/sessions/`. Idempotent.             |
| `pnpm score`      | One-off CLI: run the full pipeline against a single session JSON.    |
| `pnpm verify`     | End-to-end determinism + evidence-grounding check. Exits non-zero on failure. |
| `pnpm typecheck`  | `tsc --noEmit`.                                                      |
| `pnpm lint`       | ESLint.                                                              |

## File tour

```
app/                           Next.js App Router pages + API routes
  page.tsx                     Dashboard — ranked opportunity table
  sessions/                    Session list, new-session form, detail page
  opportunities/[id]/          Drill-down: brief + score breakdown
  api/                         Ingest, clarifying-answers, brief routes

lib/
  types.ts                     Zod schemas + inferred TS types (one source of truth)
  pipeline.ts                  analyze → score → persist
  ai/
    client.ts                  Anthropic provider + model id
    schemas.ts                 Output schemas for each pipeline pass
    prompts.ts                 System prompts (versioned)
    analyze-session.ts         Workflow → bottlenecks → clarifying gate
    score-opportunity.ts       Sub-scores from model, composite in TS
    generate-brief.ts          Per-opportunity exec brief (lazy, cached)
  scoring/
    rubric.ts                  RUBRIC_V1 — dimensions, weights, anchors
    composite.ts               Weighted mean of sub-scores
  storage/                     File-based persistence under ./data/

scripts/
  seed.ts                      Load seed transcripts
  score.ts                     CLI: run pipeline on one session
  verify.ts                    Demo-readiness smoke checks

notes/                         Tutorial notes paired to each build stage
stages/                        Per-stage build instructions
data/                          On-disk store (sessions, opportunities, briefs, seed)
```

## How to demo

See [DEMO.md](DEMO.md) for the minute-by-minute interview script. Run `pnpm verify` first so you can answer "how do you know it's deterministic?" with a screenshot.
