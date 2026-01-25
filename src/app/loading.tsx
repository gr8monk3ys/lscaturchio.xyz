export default function HomeLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Hero skeleton */}
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
          <div className="h-12 w-3/4 max-w-2xl animate-pulse rounded-lg bg-muted" />
          <div className="h-6 w-1/2 max-w-lg animate-pulse rounded-lg bg-muted" />
          <div className="flex gap-4 mt-4">
            <div className="h-12 w-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-12 w-32 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="my-16 px-4">
          <div className="h-8 w-64 mx-auto animate-pulse rounded-lg bg-muted mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="neu-card p-6">
                <div className="h-14 w-14 animate-pulse rounded-xl bg-muted mb-4" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted mb-2" />
                <div className="h-20 w-full animate-pulse rounded bg-muted mb-4" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
