interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-shimmer rounded-lg ${className}`} />
  );
}

export function InterviewCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-4 shadow-soft">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="pt-3 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4 shadow-soft">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="pt-3 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

export default Skeleton;
