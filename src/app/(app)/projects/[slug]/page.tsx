'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectNav } from '@/components/project/project-nav';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  Star,
  Zap,
} from 'lucide-react';

const project = {
  id: '1',
  name: 'TaskFlow',
  slug: 'taskflow',
  description: 'Lightweight task management API for small teams',
  color: '#6366f1',
  stage: 'development',
  health: 'green',
  priority: 4,
  progress: 68,
};

const stageLabels: Record<string, string> = {
  idea: 'Idea',
  planning: 'Planning',
  development: 'Development',
  testing: 'Testing',
  launch: 'Launch',
  maintenance: 'Maintenance',
};

const stageColors: Record<string, string> = {
  idea: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  development:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  testing:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  launch: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  maintenance: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const healthConfig: Record<
  string,
  { dot: string; label: string; badge: string }
> = {
  green: {
    dot: 'bg-green-500',
    label: 'Healthy',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  yellow: {
    dot: 'bg-yellow-500',
    label: 'Fair',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  red: {
    dot: 'bg-red-500',
    label: 'At Risk',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  stuck: {
    dot: 'bg-red-700',
    label: 'Stuck',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

const phases = [
  { stage: 'idea', name: 'Idea', status: 'completed' as const },
  { stage: 'planning', name: 'Planning', status: 'completed' as const },
  { stage: 'development', name: 'Development', status: 'active' as const },
  { stage: 'testing', name: 'Testing', status: 'pending' as const },
  { stage: 'launch', name: 'Launch', status: 'pending' as const },
  { stage: 'maintenance', name: 'Maintenance', status: 'pending' as const },
];

const blockers = [
  { id: '1', title: 'API rate limiting not implemented', severity: 'high' },
  { id: '2', title: 'Auth middleware edge case', severity: 'medium' },
];

const nextTasks = [
  { id: '1', title: 'Fix auth middleware bug', priority: 1, estimate: '2h' },
  { id: '2', title: 'Add rate limiting', priority: 1, estimate: '4h' },
  { id: '3', title: 'Write API docs', priority: 2, estimate: '3h' },
  { id: '4', title: 'Database migration', priority: 2, estimate: '1h' },
];

const recentActivity = [
  { id: '1', type: 'decision', title: 'Use Redis for session cache', time: '2h ago' },
  { id: '2', type: 'task_done', title: 'Setup CI pipeline', time: '1d ago' },
  { id: '3', type: 'note', title: 'Performance benchmarks', time: '2d ago' },
  { id: '4', type: 'blocker', title: 'API rate limiting blocker added', time: '3d ago' },
];

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

const hc = healthConfig[project.health];

export default function ProjectOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="h-12 w-12 shrink-0 rounded-xl"
          style={{ backgroundColor: `${project.color}20` }}
        >
          <div
            className="h-full w-full rounded-xl"
            style={{ backgroundColor: project.color, opacity: 0.7 }}
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
      </div>

      <ProjectNav projectSlug={project.slug} />

      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', hc.badge)}>
          <div className={cn('h-2 w-2 rounded-full', hc.dot)} />
          {hc.label}
        </div>
        <Badge variant="secondary" className={stageColors[project.stage]}>
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

      {/* Phase Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Phase Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {phases.map((phase, index) => (
              <div key={phase.stage} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all',
                      phase.status === 'completed'
                        ? 'bg-green-500 text-white shadow-sm'
                        : phase.status === 'active'
                          ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20'
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
                      'mt-1.5 text-[11px] font-medium',
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
                      'mx-1 h-0.5 flex-1 rounded-full',
                      phase.status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-border'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column: Blockers + Next Up */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Active Blockers
              <Badge variant="destructive" className="ml-auto text-xs">
                {blockers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blockers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No active blockers
              </p>
            ) : (
              <div className="space-y-2">
                {blockers.map((blocker) => (
                  <div
                    key={blocker.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'h-2 w-2 shrink-0 rounded-full',
                          blocker.severity === 'high'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        )}
                      />
                      <span className="text-sm font-medium truncate">
                        {blocker.title}
                      </span>
                    </div>
                    <Badge
                      variant={
                        blocker.severity === 'high' ? 'destructive' : 'secondary'
                      }
                      className="shrink-0 ml-2"
                    >
                      {blocker.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ArrowRight className="h-4 w-4 text-primary" />
              Next Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nextTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
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
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {recentActivity.map((activity, i) => {
              const Icon = activityIcons[activity.type];
              return (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-center gap-3 py-2.5',
                    i < recentActivity.length - 1 && 'border-b border-border/50'
                  )}
                >
                  <Icon
                    className={cn('h-4 w-4 shrink-0', activityColors[activity.type])}
                  />
                  <span className="flex-1 text-sm truncate">{activity.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
