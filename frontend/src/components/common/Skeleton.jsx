// Lightweight skeleton primitives. A pulse animation on a muted grey block.
// Use directly, or compose with the pre-made shapes below.

export function Skeleton({ className = "", rounded = "rounded-md" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-border/70 ${rounded} ${className}`}
    />
  );
}

// A card with a title bar and two text lines. Matches the shape of the
// Card-based rows used in most list pages.
export function SkeletonRow({ withAvatar = true }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4">
      {withAvatar && <Skeleton className="h-10 w-10 shrink-0" rounded="rounded-full" />}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-16" rounded="rounded-full" />
        </div>
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-full max-w-md" />
      </div>
      <div className="hidden shrink-0 gap-2 sm:flex">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

// A list of SkeletonRows stacked with the same gap the real pages use.
export function SkeletonList({ count = 4, withAvatar = true }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} withAvatar={withAvatar} />
      ))}
    </div>
  );
}

// A grid of small stat tiles — used by the admin dashboard.
export function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="mt-3 h-6 w-16" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

// A Kanban column skeleton — vertical stack of task cards.
export function SkeletonColumn({ count = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-3 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}