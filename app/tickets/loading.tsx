
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex gap-3">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-40" />
            </div>

            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>

          </CardContent>
        </Card>
      </div>
    </main>
  );
}