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
  TrendingUp,
  Zap,
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

const statConfig = [
  { label: 'Total Projects', key: 'total' as const, icon: FolderKanban, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Active', key: 'active' as const, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600' },
  { label: 'Blocked', key: 'blocked' as const, icon: AlertTriangle, gradient: 'from-red-500 to-orange-600' },
  { label: 'Maintenance', key: 'maintenance' as const, icon: Wrench, gradient: 'from-yellow-500 to-amber-600' },
];

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

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Welcome Card */}
      {projects.length === 0 && !loading && (
        <div className="relative overflow-hidden rounded-2xl glass-hero border border-white/20 dark:border-white/10">
          <div className="absolute inset-0 mesh-gradient opacity-60" />
          <div className="glow-dot bg-indigo-500/20 -top-20 -right-20 w-60 h-60 animate-pulse-glow" />
          <div className="glow-dot bg-purple-500/15 -bottom-16 -left-16 w-48 h-48 animate-pulse-glow delay-500" />
          <CardContent className="relative flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <FolderKanban className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to DevNest</h2>
            <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
              Your developer project operating system. Create your first project to start tracking
              tasks, milestones, blockers, and more.
            </p>
            <Link href="/projects/new" className="mt-8">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </div>
      )}

      {/* Recommendation Card */}
      {recommendations.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl glass-card border border-white/20 dark:border-white/10">
          <div className="absolute inset-0 mesh-gradient opacity-40" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2.5 text-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                What should I work on next?
              </CardTitle>
              <Link href="/today">
                <Button variant="outline" size="sm" className="glass-card">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between rounded-xl border border-white/20 dark:border-white/10 glass-card p-3.5 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
                      {rec.priority}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {rec.project} — {rec.reason}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="glass-card">
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      )}

      {recommendations.length === 0 && !loading && projects.length > 0 && (
        <div className="rounded-2xl glass-card border border-white/20 dark:border-white/10 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 mx-auto mb-3">
            <Lightbulb className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground text-sm">
            No recommendations yet. Complete tasks and milestones to get personalized suggestions.
          </p>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statConfig.map((stat) => {
          const value = stats[stat.key];
          return (
            <div key={stat.label} className="glass-card rounded-xl p-4 transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-sm`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '—' : value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Link href="/projects/new">
            <Button variant="outline" size="sm" className="glass-card">
              <Plus className="mr-1 h-3 w-3" />
              New
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl glass-card border border-white/20 dark:border-white/10 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mx-auto mb-4">
              <FolderKanban className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">
              No projects yet. Create your first project to get started.
            </p>
          </div>
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
