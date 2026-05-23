import * as React from "react";
import { cn } from "@/lib/utils";

export function AtlasPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("atlas-pill", className)}>{children}</span>;
}
