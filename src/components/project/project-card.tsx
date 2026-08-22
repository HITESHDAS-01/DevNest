'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: {
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
    _count?: {
      tasks: number;
      blockers: number;
    };
  };
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

const healthConfig: Record<string, { dot: string; label: string }> = {
  green: { dot: 'bg-emerald-500 shadow-emerald-500/50', label: 'Healthy' },
  yellow: { dot: 'bg-yellow-500 shadow-yellow-500/50', label: 'Fair' },
  red: { dot: 'bg-red-500 shadow-red-500/50', label: 'At Risk' },
  stuck: { dot: 'bg-red-700 shadow-red-700/50', label: 'Stuck' },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = project.progress || 0;
  const priority = project.priority || 3;
  const hc = healthConfig[project.health] || healthConfig.green;

  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="glass-card rounded-xl p-5 cursor-pointer group transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="h-3.5 w-3.5 rounded-full shadow-sm"
              style={{ backgroundColor: project.color || '#6366f1' }}
            />
            <h3 className="font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {project.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full shadow-sm', hc.dot)} />
            <span className="text-[11px] text-muted-foreground">
              {hc.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className={cn('text-[11px] border', stageColors[project.stage])}>
            {stageLabels[project.stage]}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            {'★'.repeat(priority)}{'☆'.repeat(5 - priority)}
          </span>
        </div>

        <Progress value={progress} className="h-1.5 mb-3" />

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{progress}% complete</span>
          {project._count && (
            <div className="flex items-center gap-2">
              {project._count.blockers > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {project._count.blockers} blocked
                </span>
              )}
              {project._count.tasks > 0 && (
                <span>{project._count.tasks} tasks</span>
              )}
            </div>
          )}
        </div>

        {project.description && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>
    </Link>
  );
}
