import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function OpportunityDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Skeleton className="h-3 w-32" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex flex-col gap-2 pt-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
