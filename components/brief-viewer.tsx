"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Render an executive-brief Markdown string as React elements.
 *
 * Why `react-markdown` instead of `dangerouslySetInnerHTML`:
 * the brief content originates from an LLM whose input is user-pasted text,
 * so it must be treated as untrusted. react-markdown parses into MDAST/HAST
 * and renders React elements directly — no string of HTML is ever injected.
 * See notes/react-markdown-rendering.md.
 */
const components: Components = {
  h1: ({ children }) => (
    <h1
      className="font-editorial text-[28px] font-normal leading-[1.15] tracking-tight"
      style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      className="mt-6 text-[11.5px] font-medium uppercase tracking-[0.06em]"
      style={{ color: "var(--muted)" }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      className="font-editorial mt-4 text-[20px] font-normal leading-tight"
      style={{ color: "var(--ink)" }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p
      className="text-[13.5px] leading-relaxed"
      style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}
    >
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul
      className="list-disc space-y-1 pl-5 text-[13px]"
      style={{ color: "var(--ink-soft)" }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      className="list-decimal space-y-1 pl-5 text-[13px]"
      style={{ color: "var(--ink-soft)" }}
    >
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="rounded-[8px] border-l-2 px-3 py-2.5 text-[13px] italic"
      style={{
        background: "var(--panel-2)",
        borderColor: "var(--accent)",
        color: "var(--ink-soft)",
      }}
    >
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold" style={{ color: "var(--ink)" }}>
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code
      className="rounded px-1 py-0.5 font-mono text-[12px]"
      style={{ background: "var(--panel-2)", color: "var(--ink)" }}
    >
      {children}
    </code>
  ),
  hr: () => <hr className="my-4" style={{ borderColor: "var(--rule)" }} />,
};

export function BriefViewer({ markdown }: { markdown: string }) {
  return (
    <article className="flex flex-col gap-3">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
