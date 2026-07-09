export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card-base p-6 space-y-4 animate-fade-in">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="pt-2 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function ParamSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
}