'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CalendarRange, Loader2 } from 'lucide-react';

interface Stage {
  name: string;
  start: number;
  end: number;
}

interface Project {
  name: string;
  color: string;
  stages: Stage[];
  progress: number;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const stageShades: Record<string, string> = {
  Planning: 'opacity-40',
  Development: 'opacity-70',
  Testing: 'opacity-50',
  Launch: 'opacity-100',
  Maintenance: 'opacity-30',
};

const todayPosition = 38;

export default function TimelinePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        const list = data.projects || data || [];
        setProjects(
          list.map((p: Record<string, unknown>) => ({
            name: p.name as string,
            color: (p.color as string) || '#6366f1',
            progress: (p.progress as number) || 0,
            stages: [
              { name: 'Planning', start: 0, end: 15 },
              { name: 'Development', start: 15, end: 60 },
              { name: 'Testing', start: 60, end: 78 },
              { name: 'Launch', start: 78, end: 85 },
              { name: 'Maintenance', start: 85, end: 100 },
            ],
          }))
        );
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground">
          Gantt view of all your projects across months
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 p-16 text-center">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mx-auto mb-5">
              <CalendarRange className="h-8 w-8 text-indigo-500/50" />
            </div>
            <p className="font-medium text-lg">No projects to display</p>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm mx-auto">
              Create a project to see it on the timeline.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-white/20 dark:border-white/10 p-6">
            <div className="flex mb-2">
              <div className="w-36 shrink-0" />
              <div className="flex-1 flex relative">
                {months.map((month) => (
                  <div
                    key={month}
                    className="flex-1 text-center text-xs font-medium text-muted-foreground border-l border-white/10 dark:border-white/5 first:border-l-0"
                  >
                    <div className="py-2 border-b border-white/10 dark:border-white/5">{month} 2026</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-0">
              {projects.map((project, pi) => (
                <div
                  key={project.name}
                  className={cn(
                    'flex items-center',
                    pi < projects.length - 1 && 'border-b border-white/10 dark:border-white/5'
                  )}
                >
                  <div className="w-36 shrink-0 flex items-center gap-2.5 pr-4 py-3">
                    <div
                      className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium truncate">
                      {project.name}
                    </span>
                  </div>
                  <div className="flex-1 relative h-12">
                    <div className="absolute inset-0 flex">
                      {months.map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-l border-white/5 first:border-l-0"
                        />
                      ))}
                    </div>

                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-500/60 z-10"
                      style={{ left: `${todayPosition}%` }}
                    />

                    {project.stages.map((stage) => (
                      <div
                        key={stage.name}
                        className={cn(
                          'absolute top-2 bottom-2 rounded-md transition-all',
                          stageShades[stage.name]
                        )}
                        style={{
                          left: `${stage.start}%`,
                          width: `${Math.max(stage.end - stage.start, 1)}%`,
                          backgroundColor: project.color,
                        }}
                        title={`${stage.name}: ${stage.start}% – ${stage.end}%`}
                      />
                    ))}

                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-foreground/80 z-10"
                      style={{ left: `${project.progress}%` }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-foreground border-2 border-background shadow-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex mt-3">
              <div className="w-36 shrink-0" />
              <div className="flex-1 relative h-5">
                <div
                  className="absolute text-[10px] font-semibold text-red-500 bg-background px-1.5 py-0.5 rounded border border-red-500/30"
                  style={{
                    left: `${todayPosition}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  Today
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Stages:
            </span>
            {Object.entries(stageShades).map(([name, shade]) => (
              <div key={name} className="flex items-center gap-2">
                <div className={cn('h-3 w-6 rounded-sm bg-primary', shade)} />
                <span className="text-xs text-muted-foreground">{name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 ml-2">
              <div className="h-3 w-0.5 bg-red-500" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative h-3 w-6">
                <div className="absolute inset-0 rounded-sm bg-primary/40" />
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-2 h-2 -ml-1 rounded-full bg-foreground border-2 border-background shadow-sm" />
              </div>
              <span className="text-xs text-muted-foreground">Current Progress</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
