'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  idea: 'bg-purple-100 text-purple-800',
  planning: 'bg-blue-100 text-blue-800',
  development: 'bg-yellow-100 text-yellow-800',
  testing: 'bg-orange-100 text-orange-800',
  launch: 'bg-green-100 text-green-800',
  maintenance: 'bg-gray-100 text-gray-800',
};

const healthColors: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  stuck: 'bg-red-700',
};

const healthLabels: Record<string, string> = {
  green: 'Healthy',
  yellow: 'Fair',
  red: 'At Risk',
  stuck: 'Stuck',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = project.progress || 0;
  const priority = project.priority || 3;

  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className="h-full transition-all hover:shadow-md cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: project.color || '#6366f1' }}
              />
              <h3 className="font-semibold">{project.name}</h3>
            </div>
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  healthColors[project.health]
                )}
              />
              <span className="text-xs text-muted-foreground">
                {healthLabels[project.health]}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={stageColors[project.stage]}>
              {stageLabels[project.stage]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {'★'.repeat(priority)}{'☆'.repeat(5 - priority)}
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress}% complete</span>
            {project._count && (
              <span>
                {project._count.blockers > 0 && (
                  <span className="text-red-500">
                    {project._count.blockers} blocked
                  </span>
                )}
                {project._count.tasks > 0 && (
                  <span>{project._count.tasks} tasks</span>
                )}
              </span>
            )}
          </div>

          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
