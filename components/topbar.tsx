import * as React from "react";

export function Topbar({
  title,
  subtitle,
  right,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`flex items-end justify-between gap-5 border-b px-7 pb-[18px] pt-[22px] ${className ?? ""}`}
      style={{ borderColor: "var(--rule)" }}
    >
      <div className="min-w-0">
        <h1
          className="font-editorial text-[32px] font-normal leading-none tracking-tight"
          style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-2 max-w-[640px] text-[13.5px] leading-snug"
            style={{ color: "var(--muted)", lineHeight: 1.45 }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}

export function Breadcrumb({
  segments,
}: {
  segments: Array<{ label: string; href?: string }>;
}) {
  return (
    <div
      className="px-7 pt-[18px] text-[12px]"
      style={{ color: "var(--muted)" }}
    >
      {segments.map((seg, idx) => {
        const last = idx === segments.length - 1;
        return (
          <span key={`${seg.label}-${idx}`}>
            {seg.href && !last ? (
              <a
                href={seg.href}
                className="no-underline hover:underline"
                style={{ color: "var(--muted)" }}
              >
                {seg.label}
              </a>
            ) : (
              <span style={{ color: last ? "var(--ink-soft)" : "var(--muted)" }}>
                {seg.label}
              </span>
            )}
            {!last && (
              <span className="mx-1" style={{ color: "var(--muted-2)" }}>
                ›
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
