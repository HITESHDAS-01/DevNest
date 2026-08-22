'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/project/project-card';
import { Lightbulb, FolderKanban, AlertTriangle, Wrench } from 'lucide-react';
import Link from 'next/link';

// Demo data for preview
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

const stats = [
  { label: 'Total Projects', value: 4, icon: FolderKanban },
  { label: 'Active', value: 4, icon: FolderKanban },
  { label: 'Blocked', value: 1, icon: AlertTriangle },
  { label: 'In Maintenance', value: 1, icon: Wrench },
];

const recommendations = [
  {
    id: '1',
    title: 'Fix auth middleware bug',
    project: 'TaskFlow',
    priority: 1,
    reason: 'Blocking 2 tasks',
  },
  {
    id: '2',
    title: 'Add rate limiting',
    project: 'APIProxy',
    priority: 1,
    reason: 'Project stuck, needs attention',
  },
  {
    id: '3',
    title: 'Write API documentation',
    project: 'TaskFlow',
    priority: 2,
    reason: 'Milestone due in 5 days',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Recommendation Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              What should I work on next?
            </CardTitle>
            <Link href="/today">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {rec.priority}
                  </div>
                  <div>
                    <p className="font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {rec.project} — {rec.reason}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Start
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-muted p-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              All
            </Button>
            <Button variant="ghost" size="sm">
              Active
            </Button>
            <Button variant="ghost" size="sm">
              Blocked
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {demoProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
