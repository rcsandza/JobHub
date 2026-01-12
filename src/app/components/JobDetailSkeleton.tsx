import { Skeleton } from './ui/skeleton';

export function JobDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-muted" />
          <Skeleton className="h-10 w-full max-w-2xl bg-muted" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24 bg-muted" />
          <Skeleton className="h-8 w-32 bg-muted" />
          <Skeleton className="h-8 w-28 bg-muted" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-full bg-muted" />
          <Skeleton className="h-6 w-full bg-muted" />
          <Skeleton className="h-6 w-3/4 bg-muted" />
        </div>

        <Skeleton className="h-12 w-full max-w-xs bg-muted" />
      </div>
    </div>
  );
}