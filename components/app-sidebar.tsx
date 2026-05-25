import Link from "next/link";
import { Sparkles, Circle } from "lucide-react";
import { listSessions } from "@/lib/storage/sessions";
import { SidebarNav } from "@/components/sidebar-nav";

async function safeListSessions() {
  try {
    return await listSessions();
  } catch {
    return [];
  }
}

export async function AppSidebar() {
  const sessions = await safeListSessions();
  const pinned = [...sessions]
    .sort((a, b) => b.ingested_at.localeCompare(a.ingested_at))
    .slice(0, 3);

  return (
    <aside
      className="sticky top-0 flex h-screen w-[224px] flex-shrink-0 flex-col border-r px-[14px] py-[18px]"
      style={{
        background: "var(--panel-2)",
        borderColor: "var(--rule)",
      }}
    >
      <div className="flex items-center gap-2.5 px-1 pb-[18px] pt-0.5">
        <div
          className="grid h-[30px] w-[30px] place-items-center rounded-[9px] text-white"
          style={{ background: "var(--accent)" }}
        >
          <Sparkles className="h-[15px] w-[15px]" />
        </div>
        <div className="leading-tight">
          <div
            className="text-[14px] font-semibold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            CX Intel
          </div>
          <div className="text-[11px]" style={{ color: "var(--muted)" }}>
            Discovery → backlog
          </div>
        </div>
      </div>

      <SidebarNav />

      <div className="my-3 h-px" style={{ background: "var(--rule)" }} />
      <div
        className="px-1.5 pb-2 text-[11px] font-medium"
        style={{ color: "var(--muted)" }}
      >
        Pinned
      </div>
      <ul className="m-0 list-none p-0">
        {pinned.map((s) => (
          <li key={s.id}>
            <Link
              href={`/sessions/${s.id}`}
              className="flex items-center gap-2 truncate px-2.5 py-1.5 text-[12.5px] hover:rounded-[8px]"
              style={{ color: "var(--ink-soft)" }}
            >
              <Circle
                className="h-1.5 w-1.5 flex-shrink-0 fill-current"
                style={{ color: "var(--accent)" }}
              />
              <span className="truncate">{s.title}</span>
            </Link>
          </li>
        ))}
        {pinned.length === 0 && (
          <li
            className="px-2.5 py-1.5 text-[11.5px]"
            style={{ color: "var(--muted-2)" }}
          >
            No sessions yet.
          </li>
        )}
      </ul>

      <div
        className="mt-auto rounded-[10px] border p-2.5"
        style={{
          background: "var(--panel)",
          borderColor: "var(--rule)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent-ink)",
            }}
          >
            MT
          </div>
          <div className="leading-tight">
            <div className="text-[12.5px]" style={{ color: "var(--ink)" }}>
              M. Tang
            </div>
            <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>
              Local workspace
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
