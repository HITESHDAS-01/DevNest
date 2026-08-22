'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectNav } from '@/components/project/project-nav';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  Star,
  Zap,
  Loader2,
  Plus,
  GitBranch,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  stage: string;
  health: string;
  priority: number;
  progress: number;
  repoUrl?: string | null;
}

interface Blocker {
  id: string;
  title: string;
  severity: string;
}

interface Task {
  id: string;
  title: string;
  priority: number;
  estimate: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  time: string;
}

const stageLabels: Record<string, string> = {
  idea: 'Idea',
  planning: 'Planning',
  development: 'Development',
  testing: 'Testing',
  launch: 'Launch',
  maintenance: 'Maintenance',
};

const stageColors: Record<string, string> = {
  idea: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  planning: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  development: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  testing: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  launch: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  maintenance: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

const healthConfig: Record<string, { dot: string; label: string; gradient: string }> = {
  green: { dot: 'bg-emerald-500 shadow-emerald-500/50', label: 'Healthy', gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20' },
  yellow: { dot: 'bg-yellow-500 shadow-yellow-500/50', label: 'Fair', gradient: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20' },
  red: { dot: 'bg-red-500 shadow-red-500/50', label: 'At Risk', gradient: 'from-red-500/10 to-orange-500/10 border-red-500/20' },
  stuck: { dot: 'bg-red-700 shadow-red-700/50', label: 'Stuck', gradient: 'from-red-600/10 to-red-500/10 border-red-600/20' },
};

const activityIcons: Record<string, typeof Target> = {
  decision: Target,
  task_done: CheckCircle2,
  note: Clock,
  blocker: AlertTriangle,
};

const activityColors: Record<string, string> = {
  decision: 'text-purple-500',
  task_done: 'text-green-500',
  note: 'text-blue-500',
  blocker: 'text-red-500',
};

export default function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [nextTasks, setNextTasks] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [githubLinked, setGithubLinked] = useState(false);
  const [githubSyncing, setGithubSyncing] = useState(false);
  const [githubLinking, setGithubLinking] = useState(false);
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const fetchData = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      const [projectRes, blockersRes, tasksRes, activityRes] = await Promise.allSettled([
        fetch(`/api/projects/${slug}`),
        fetch(`/api/projects/${slug}/blockers`),
        fetch(`/api/projects/${slug}/tasks`),
        fetch(`/api/projects/${slug}/activity`),
      ]);

      if (projectRes.status === 'fulfilled' && projectRes.value.ok) {
        const data = await projectRes.value.json();
        setProject(data.project || data);
      }

      if (blockersRes.status === 'fulfilled' && blockersRes.value.ok) {
        const data = await blockersRes.value.json();
        setBlockers((data.blockers || data || []).filter((b: Blocker) => b.severity !== 'resolved'));
      }

      if (tasksRes.status === 'fulfilled' && tasksRes.value.ok) {
        const data = await tasksRes.value.json();
        const tasks: Task[] = data.tasks || data || [];
        setNextTasks(tasks.filter((t) => t.priority <= 2).slice(0, 4));
      }

      if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
        const data = await activityRes.value.json();
        setRecentActivity((data.activity || data || []).slice(0, 4));
      }

      setError('');
    } catch {
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    params.then(({ slug }) => fetchData(slug));
  }, [params, fetchData]);

  const handleLinkGithub = async () => {
    if (!githubRepoUrl.trim()) return;
    setGithubLinking(true);
    try {
      const res = await fetch(`/api/projects/${project?.id}/github/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: githubRepoUrl }),
      });
      if (res.ok) {
        setGithubLinked(true);
        setGithubRepoUrl('');
      }
    } finally {
      setGithubLinking(false);
    }
  };

  const handleSyncGithub = async () => {
    setGithubSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(`/api/projects/${project?.id}/github/sync`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setSyncResult(`Synced ${data.synced.tasksCreated} tasks, ${data.synced.blockersCreated} blockers`);
        fetchData(project!.slug);
      }
    } finally {
      setGithubSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive backdrop-blur-sm">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  const hc = healthConfig[project.health] || healthConfig.green;
  const phases = [
    { stage: 'idea', name: 'Idea', status: 'completed' as const },
    { stage: 'planning', name: 'Planning', status: 'completed' as const },
    { stage: 'development', name: 'Development', status: project.stage === 'development' ? ('active' as const) : ('pending' as const) },
    { stage: 'testing', name: 'Testing', status: 'pending' as const },
    { stage: 'launch', name: 'Launch', status: 'pending' as const },
    { stage: 'maintenance', name: 'Maintenance', status: 'pending' as const },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive backdrop-blur-sm">{error}</div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl glass-card border border-white/20 dark:border-white/10 p-6">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative flex items-start gap-4">
          <div
            className="h-14 w-14 shrink-0 rounded-2xl shadow-lg"
            style={{ backgroundColor: project.color }}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="mt-1 text-muted-foreground">{project.description}</p>
          </div>
        </div>
      </div>

      <ProjectNav projectSlug={project.slug} />

      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium bg-gradient-to-r', hc.gradient)}>
          <div className={cn('h-2 w-2 rounded-full shadow-sm', hc.dot)} />
          {hc.label}
        </div>
        <Badge variant="secondary" className={cn('border', stageColors[project.stage])}>
          {stageLabels[project.stage]}
        </Badge>
        <div className="flex items-center gap-0.5 text-sm text-muted-foreground">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3.5 w-3.5',
                i < project.priority
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/30'
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {project.progress}%
        </span>
      </div>

      {/* GitHub Integration */}
      <div className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-500/10">
            <GitBranch className="h-3.5 w-3.5 text-gray-500" />
          </div>
          <p className="text-sm font-semibold">GitHub</p>
        </div>
        {project.repoUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {project.repoUrl.replace('https://github.com/', '')}
              </a>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="glass-card"
                onClick={handleSyncGithub}
                disabled={githubSyncing}
              >
                {githubSyncing ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 h-3 w-3" />
                )}
                Sync Issues & PRs
              </Button>
            </div>
            {syncResult && (
              <p className="text-xs text-emerald-500 font-medium">{syncResult}</p>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="https://github.com/owner/repo"
              value={githubRepoUrl}
              onChange={(e) => setGithubRepoUrl(e.target.value)}
              className="flex-1 h-9 text-sm glass-card border-white/20 dark:border-white/10"
            />
            <Button
              size="sm"
              onClick={handleLinkGithub}
              disabled={githubLinking || !githubRepoUrl.trim()}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm"
            >
              {githubLinking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Link Repo'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Phase Pipeline */}
      <div className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Phase Pipeline</p>
        <div className="flex items-center">
          {phases.map((phase, index) => (
            <div key={phase.stage} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold transition-all',
                    phase.status === 'completed'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                      : phase.status === 'active'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/20'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {phase.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : phase.status === 'active' ? (
                    <Zap className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-[11px] font-medium',
                    phase.status === 'active'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {phase.name}
                </span>
              </div>
              {index < phases.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 rounded-full',
                    phase.status === 'completed'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Blockers + Next Up */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            </div>
            <p className="text-sm font-semibold">Active Blockers</p>
            <Badge variant="destructive" className="ml-auto text-[11px]">
              {blockers.length}
            </Badge>
          </div>
          {blockers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 mb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500/60" />
              </div>
              <p className="text-sm text-muted-foreground">No active blockers</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockers.map((blocker) => (
                <div
                  key={blocker.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 dark:border-white/5 glass-card p-3 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'h-2.5 w-2.5 shrink-0 rounded-full shadow-sm',
                        blocker.severity === 'high' || blocker.severity === 'critical'
                          ? 'bg-red-500 shadow-red-500/50'
                          : 'bg-yellow-500 shadow-yellow-500/50'
                      )}
                    />
                    <span className="text-sm font-medium truncate">
                      {blocker.title}
                    </span>
                  </div>
                  <Badge
                    variant={
                      blocker.severity === 'high' || blocker.severity === 'critical'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="shrink-0 ml-2 text-[11px]"
                  >
                    {blocker.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10">
              <ArrowRight className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <p className="text-sm font-semibold">Next Up</p>
          </div>
          {nextTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 mb-3">
                <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">No tasks yet</p>
              <Link href={`/projects/${project.slug}/tasks`}>
                <Button variant="outline" size="sm" className="mt-3 glass-card">
                  <Plus className="mr-1 h-3 w-3" />
                  Add Task
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {nextTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 dark:border-white/5 glass-card p-3 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-bold text-white shadow-sm">
                      {task.priority}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        ~{task.estimate}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recent Activity</p>
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 mb-3">
              <Clock className="h-5 w-5 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-0">
            {recentActivity.map((activity, i) => {
              const Icon = activityIcons[activity.type] || Clock;
              return (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-center gap-3 py-3',
                    i < recentActivity.length - 1 && 'border-b border-white/10 dark:border-white/5'
                  )}
                >
                  <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50')}>
                    <Icon
                      className={cn('h-3.5 w-3.5', activityColors[activity.type] || 'text-muted-foreground')}
                    />
                  </div>
                  <span className="flex-1 text-sm truncate">{activity.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
