export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </div>

      <div className="h-2 bg-muted rounded-full animate-pulse" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
