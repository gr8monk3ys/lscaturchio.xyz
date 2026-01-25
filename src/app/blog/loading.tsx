export default function BlogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-12 text-center">
        <div className="h-10 w-48 mx-auto animate-pulse rounded-lg bg-muted mb-4" />
        <div className="h-5 w-96 max-w-full mx-auto animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Blog grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <article key={i} className="neu-card overflow-hidden">
            <div className="h-48 w-full animate-pulse bg-muted" />
            <div className="p-6">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-6 w-full animate-pulse rounded bg-muted mb-2" />
              <div className="h-4 w-full animate-pulse rounded bg-muted mb-1" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
