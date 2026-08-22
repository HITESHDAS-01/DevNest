import Link from 'next/link';

export default function ProjectNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold">Project Not Found</h2>
      <p className="text-muted-foreground">
        The project you are looking for does not exist or has been removed.
      </p>
      <Link
        href="/projects"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Back to Projects
      </Link>
    </div>
  );
}
