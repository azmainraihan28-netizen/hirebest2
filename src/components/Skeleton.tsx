export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[color-mix(in_srgb,var(--color-fg)_8%,transparent)] ${className}`} />
}

export function SkeletonRow({ height = 64 }: { height?: number }) {
  return (
    <div className="card p-4 flex items-center gap-3" style={{ height }}>
      <Skeleton className="w-10 h-10 rounded-full"/>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3"/>
        <Skeleton className="h-2.5 w-1/2"/>
      </div>
      <Skeleton className="w-12 h-12 rounded-full"/>
      <Skeleton className="w-16 h-7"/>
    </div>
  )
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <Skeleton className="h-3 w-20 mb-3"/>
          <Skeleton className="h-8 w-16"/>
        </div>
      ))}
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}/>
      ))}
    </div>
  )
}
