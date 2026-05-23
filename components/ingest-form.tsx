"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, ArrowRight } from "lucide-react";

type IngestResponse = {
  session_id: string;
  needs_clarification: boolean;
};

const ACCEPTED_EXTENSIONS = [".txt", ".md"];

export function IngestForm() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [title, setTitle] = React.useState("");
  const [rawText, setRawText] = React.useState("");
  const [supplemental, setSupplemental] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const stats = React.useMemo(() => {
    const words = rawText.trim().split(/\s+/).filter(Boolean).length;
    const turns = countTurns(rawText);
    return { words, turns };
  }, [rawText]);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRawText(text);
    if (!title) {
      setTitle(file.name.replace(/\.(txt|md)$/i, ""));
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedText = rawText.trim();
    if (!trimmedTitle || !trimmedText) {
      setError("Title and transcript are both required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          raw_text: trimmedText,
          supplemental_context: supplemental.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const detail = await safeReadError(res);
        throw new Error(detail);
      }

      const data = (await res.json()) as IngestResponse;
      router.push(`/sessions/${data.session_id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingest failed.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <Field label="Title" hint="What was the conversation about?">
        <input
          placeholder="e.g. Tier 1 support triage walkthrough"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
          required
          style={inputStyle}
        />
      </Field>

      <Field
        label="Discovery transcript"
        required
        hint="Paste the full conversation or upload a file."
        right={
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[12.5px]"
            style={{ color: "var(--ink-soft)" }}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload .txt or .md
          </button>
        }
      >
        <div className="relative">
          <textarea
            placeholder="Paste the full transcript. Include speaker labels, side notes, and any quoted numbers — the more concrete, the better the extraction."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={submitting}
            required
            style={{
              ...inputStyle,
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              minHeight: 220,
              lineHeight: 1.6,
              resize: "vertical",
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(",")}
            className="sr-only"
            onChange={onFileChange}
          />
          {rawText && (
            <div
              className="pointer-events-none absolute bottom-2.5 right-3.5 text-[11px]"
              style={{ color: "var(--muted-2)" }}
            >
              {stats.words.toLocaleString()} word{stats.words === 1 ? "" : "s"}
              {stats.turns > 0 && ` · ${stats.turns} turns`}
            </div>
          )}
        </div>
      </Field>

      <Field
        label="Supplemental context"
        hint="Optional — anything the transcript doesn't capture."
      >
        <textarea
          placeholder="Team size, tooling, recent incidents, what 'good' looks like…"
          value={supplemental}
          onChange={(e) => setSupplemental(e.target.value)}
          disabled={submitting}
          style={{
            ...inputStyle,
            minHeight: 70,
            resize: "vertical",
          }}
        />
      </Field>

      {error && (
        <div
          className="mt-2 rounded-[8px] border px-3 py-2 text-[12.5px]"
          style={{
            borderColor: "color-mix(in oklch, var(--score-lo) 35%, var(--rule))",
            background: "color-mix(in oklch, var(--score-lo) 6%, var(--panel))",
            color: "var(--score-lo)",
          }}
        >
          {error}
        </div>
      )}

      <div className="mt-[18px] flex items-center gap-3.5">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-[8px] px-[18px] py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          {submitting ? "Analysing transcript…" : "Run analysis"}
          {!submitting && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
        <span className="text-[12px]" style={{ color: "var(--muted)" }}>
          workflow → bottlenecks → clarify → score · ~30–60s
        </span>
      </div>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--rule)",
  background: "var(--panel-2)",
  padding: "10px 12px",
  borderRadius: 10,
  fontFamily: "var(--font-sans)",
  fontSize: 13.5,
  color: "var(--ink)",
  outline: "none",
};

function Field({
  label,
  hint,
  required,
  right,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[18px]">
      <div className="mb-1 flex items-center justify-between">
        <label
          className="text-[13px] font-medium"
          style={{ color: "var(--ink)" }}
        >
          {label}
          {required && (
            <span
              className="ml-1"
              style={{ color: "var(--accent)" }}
              aria-hidden
            >
              *
            </span>
          )}
        </label>
        {right}
      </div>
      {hint && (
        <p
          className="mb-[7px] text-[12px]"
          style={{ color: "var(--muted)" }}
        >
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

function countTurns(text: string): number {
  if (!text.trim()) return 0;
  // Heuristic: count lines that look like "Speaker: …"
  const lines = text.split("\n");
  return lines.filter((l) => /^[\p{L}\p{N}][^:\n]{0,40}:/u.test(l.trim()))
    .length;
}

async function safeReadError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; detail?: string };
    if (body.detail) return `${body.error ?? "Error"}: ${body.detail}`;
    if (body.error) return body.error;
  } catch {
    // fall through
  }
  return `Request failed with status ${res.status}`;
}
