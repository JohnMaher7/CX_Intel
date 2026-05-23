import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <header
        className="flex items-end justify-between gap-5 border-b px-7 pb-[18px] pt-[22px]"
        style={{ borderColor: "var(--rule)" }}
      >
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-32" />
      </header>

      <div className="grid grid-cols-1 gap-3 px-7 pb-2.5 pt-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[12px] border bg-card px-4 py-3.5"
            style={{ borderColor: "var(--rule)" }}
          >
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="mb-2 h-8 w-14" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div
        className="mx-7 mt-3 overflow-hidden rounded-[12px] border bg-card"
        style={{ borderColor: "var(--rule)" }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3.5"
            style={{
              borderBottom: i < 5 ? "1px solid var(--rule-soft)" : "none",
            }}
          >
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </>
  );
}
