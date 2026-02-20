export default function ProjectsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-12 text-center">
        <div className="h-10 w-56 mx-auto animate-pulse rounded-lg bg-muted mb-4" />
        <div className="h-5 w-80 max-w-full mx-auto animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Projects grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((slot) => (
          <div key={`projects-loading-card-${slot}`} className="neu-card overflow-hidden">
            <div className="h-64 w-full animate-pulse bg-muted" />
            <div className="p-6">
              <div className="h-7 w-3/4 animate-pulse rounded bg-muted mb-3" />
              <div className="h-4 w-full animate-pulse rounded bg-muted mb-1" />
              <div className="h-4 w-full animate-pulse rounded bg-muted mb-1" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted mb-4" />
              <div className="flex gap-2">
                <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
