export default function AboutLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile section skeleton */}
      <div className="flex flex-col md:flex-row gap-8 items-center mb-12">
        <div className="h-48 w-48 rounded-full animate-pulse bg-muted flex-shrink-0" />
        <div className="flex-1 text-center md:text-left">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-muted mb-4" />
          <div className="h-5 w-full animate-pulse rounded bg-muted mb-2" />
          <div className="h-5 w-full animate-pulse rounded bg-muted mb-2" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Bio sections skeleton */}
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="neu-card p-6">
            <div className="h-7 w-48 animate-pulse rounded bg-muted mb-4" />
            <div className="h-4 w-full animate-pulse rounded bg-muted mb-2" />
            <div className="h-4 w-full animate-pulse rounded bg-muted mb-2" />
            <div className="h-4 w-full animate-pulse rounded bg-muted mb-2" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
