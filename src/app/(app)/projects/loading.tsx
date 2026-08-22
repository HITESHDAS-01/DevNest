export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 mt-2 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
