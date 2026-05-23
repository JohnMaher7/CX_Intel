import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SessionDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-5 w-36" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
