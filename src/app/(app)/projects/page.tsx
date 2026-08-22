'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/project/project-card';
import { Plus, FolderKanban, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  stage: string;
  status: string;
  health: string;
  priority?: number | null;
  progress?: number | null;
  _count?: { tasks: number; blockers: number };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || data || []);
      }
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage all your software projects in one place
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl glass-card border border-white/20 dark:border-white/10 p-16 text-center">
          <div className="absolute inset-0 mesh-gradient opacity-40" />
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mx-auto mb-5">
              <FolderKanban className="h-8 w-8 text-indigo-500/50" />
            </div>
            <p className="font-medium text-lg">No projects yet</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Create your first project to start tracking tasks, milestones, blockers, and more.
            </p>
            <Link href="/projects/new" className="mt-6 inline-block">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
