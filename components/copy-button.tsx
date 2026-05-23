"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  text,
  label = "Copy",
  variant = "ghost",
  className,
  iconOnly,
}: {
  text: string;
  label?: string;
  variant?: "primary" | "ghost";
  className?: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const Icon = copied ? Check : Copy;
  const baseStyle: React.CSSProperties =
    variant === "primary"
      ? {
          background: "var(--accent)",
          color: "white",
          padding: "7px 14px",
          fontSize: 13,
          fontWeight: 500,
        }
      : {
          color: "var(--ink-soft)",
          padding: "6px 10px",
          fontSize: 12.5,
        };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-[8px] ${className ?? ""}`}
      style={baseStyle}
      disabled={!text}
    >
      <Icon className="h-3.5 w-3.5" />
      {!iconOnly && (copied ? "Copied" : label)}
    </button>
  );
}
