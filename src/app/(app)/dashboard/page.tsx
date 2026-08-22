'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/project/project-card';
import {
  Lightbulb,
  FolderKanban,
  AlertTriangle,
  Wrench,
  Plus,
  Loader2,
} from 'lucide-react';
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

interface Stats {
  total: number;
  active: number;
  blocked: number;
  maintenance: number;
}

interface Recommendation {
  id: string;
  title: string;
  project: string;
  priority: number;
  reason: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, blocked: 0, maintenance: 0 });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsRes, recsRes] = await Promise.allSettled([
        fetch('/api/projects'),
        fetch('/api/recommendations'),
      ]);

      if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
        const data = await projectsRes.value.json();
        const projectList: Project[] = data.projects || data || [];
        setProjects(projectList);
        setStats({
          total: projectList.length,
          active: projectList.filter((p) => p.status === 'active').length,
          blocked: projectList.filter((p) => p.health === 'red' || p.health === 'stuck').length,
          maintenance: projectList.filter((p) => p.stage === 'maintenance').length,
        });
      }

      if (recsRes.status === 'fulfilled' && recsRes.value.ok) {
        const data = await recsRes.value.json();
        setRecommendations(data.recommendations || data || []);
      }

      setError('');
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statItems = [
    { label: 'Total Projects', value: stats.total, icon: FolderKanban },
    { label: 'Active', value: stats.active, icon: FolderKanban },
    { label: 'Blocked', value: stats.blocked, icon: AlertTriangle },
    { label: 'In Maintenance', value: stats.maintenance, icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Welcome Card */}
      {projects.length === 0 && !loading && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-2xl bg-primary/10 p-4">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Welcome to DevNest</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Your developer project operating system. Create your first project to start tracking
              tasks, milestones, blockers, and more.
            </p>
            <Link href="/projects/new" className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recommendation Card */}
      {recommendations.length > 0 && (
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
      )}

      {recommendations.length === 0 && !loading && projects.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Lightbulb className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No recommendations yet. Complete tasks and milestones to get personalized suggestions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statItems.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-muted p-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '—' : stat.value}</p>
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
            <Link href="/projects/new">
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-3 w-3" />
                New
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No projects yet. Create your first project to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
