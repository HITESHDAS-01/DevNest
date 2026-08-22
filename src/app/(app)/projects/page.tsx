'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/project/project-card';
import { Plus } from 'lucide-react';
import Link from 'next/link';

// Demo data
const demoProjects = [
  {
    id: '1',
    name: 'TaskFlow',
    slug: 'taskflow',
    description: 'Lightweight task management API for small teams',
    color: '#6366f1',
    stage: 'development',
    status: 'active',
    health: 'green',
    priority: 4,
    progress: 68,
    _count: { tasks: 12, blockers: 2 },
  },
  {
    id: '2',
    name: 'DevNest',
    slug: 'devnest',
    description: 'Developer project operating system',
    color: '#8b5cf6',
    stage: 'development',
    status: 'active',
    health: 'yellow',
    priority: 5,
    progress: 35,
    _count: { tasks: 8, blockers: 0 },
  },
  {
    id: '3',
    name: 'SiteGen',
    slug: 'sitegen',
    description: 'Static site generator for documentation',
    color: '#10b981',
    stage: 'maintenance',
    status: 'active',
    health: 'green',
    priority: 3,
    progress: 100,
    _count: { tasks: 5, blockers: 0 },
  },
  {
    id: '4',
    name: 'APIProxy',
    slug: 'apiproxy',
    description: 'API gateway and rate limiting service',
    color: '#f59e0b',
    stage: 'development',
    status: 'active',
    health: 'red',
    priority: 2,
    progress: 45,
    _count: { tasks: 6, blockers: 3 },
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage all your software projects in one place
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demoProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
