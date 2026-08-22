'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

const projects: Project[] = [
  {
    name: 'TaskFlow',
    color: '#6366f1',
    stages: [
      { name: 'Planning', start: 0, end: 12 },
      { name: 'Development', start: 12, end: 58 },
      { name: 'Testing', start: 58, end: 72 },
      { name: 'Launch', start: 72, end: 78 },
      { name: 'Maintenance', start: 78, end: 100 },
    ],
    progress: 62,
  },
  {
    name: 'DevNest',
    color: '#8b5cf6',
    stages: [
      { name: 'Planning', start: 8, end: 20 },
      { name: 'Development', start: 20, end: 65 },
      { name: 'Testing', start: 65, end: 80 },
      { name: 'Launch', start: 80, end: 88 },
      { name: 'Maintenance', start: 88, end: 100 },
    ],
    progress: 35,
  },
  {
    name: 'SiteGen',
    color: '#10b981',
    stages: [
      { name: 'Planning', start: 0, end: 8 },
      { name: 'Development', start: 8, end: 35 },
      { name: 'Testing', start: 35, end: 50 },
      { name: 'Launch', start: 50, end: 55 },
      { name: 'Maintenance', start: 55, end: 100 },
    ],
    progress: 100,
  },
  {
    name: 'APIProxy',
    color: '#f59e0b',
    stages: [
      { name: 'Planning', start: 4, end: 16 },
      { name: 'Development', start: 16, end: 52 },
      { name: 'Testing', start: 52, end: 68 },
      { name: 'Launch', start: 68, end: 75 },
      { name: 'Maintenance', start: 75, end: 100 },
    ],
    progress: 45,
  },
  {
    name: 'CloudSync',
    color: '#ec4899',
    stages: [
      { name: 'Planning', start: 15, end: 28 },
      { name: 'Development', start: 28, end: 60 },
      { name: 'Testing', start: 60, end: 78 },
      { name: 'Launch', start: 78, end: 85 },
      { name: 'Maintenance', start: 85, end: 100 },
    ],
    progress: 18,
  },
];

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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Timeline</h1>
        <p className="text-muted-foreground">
          Gantt view of all your projects across months
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Month headers */}
          <div className="flex mb-2">
            <div className="w-36 shrink-0" />
            <div className="flex-1 flex relative">
              {months.map((month, i) => (
                <div
                  key={month}
                  className="flex-1 text-center text-xs font-medium text-muted-foreground border-l border-border first:border-l-0"
                >
                  <div className="py-2 border-b border-border">{month} 2026</div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-0">
            {projects.map((project, pi) => (
              <div
                key={project.name}
                className={cn(
                  'flex items-center',
                  pi < projects.length - 1 && 'border-b border-border/50'
                )}
              >
                <div className="w-36 shrink-0 flex items-center gap-2 pr-4 py-3">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm font-medium truncate">
                    {project.name}
                  </span>
                </div>
                <div className="flex-1 relative h-12">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex">
                    {months.map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-l border-border/50 first:border-l-0"
                      />
                    ))}
                  </div>

                  {/* Today line */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-500/60 z-10"
                    style={{ left: `${todayPosition}%` }}
                  />

                  {/* Stage bars */}
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

                  {/* Progress marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground/80 z-10"
                    style={{ left: `${project.progress}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-foreground border-2 border-background" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Today label */}
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
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Stages:
        </span>
        {Object.entries(stageShades).map(([name, shade]) => (
          <div key={name} className="flex items-center gap-2">
            <div
              className={cn('h-3 w-6 rounded-sm bg-primary', shade)}
            />
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
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-2 h-2 -ml-1 rounded-full bg-foreground border-2 border-background" />
          </div>
          <span className="text-xs text-muted-foreground">Current Progress</span>
        </div>
      </div>
    </div>
  );
}
