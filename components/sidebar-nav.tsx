"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle } from "lucide-react";

const items = [
  { href: "/", label: "Backlog", icon: LayoutDashboard, match: (p: string) => p === "/" || p.startsWith("/opportunities") || p.startsWith("/compare") },
  { href: "/sessions", label: "Sessions", icon: FileText, match: (p: string) => p === "/sessions" || (p.startsWith("/sessions/") && p !== "/sessions/new") },
  { href: "/sessions/new", label: "New session", icon: PlusCircle, match: (p: string) => p === "/sessions/new" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
      {items.map((item) => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13.5px] transition-colors"
              style={
                active
                  ? {
                      background: "var(--accent)",
                      color: "white",
                      fontWeight: 500,
                    }
                  : {
                      color: "var(--ink-soft)",
                    }
              }
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
