'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectNav } from '@/components/project/project-nav';
import { Plus, GripVertical, Loader2, ListTodo } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  priority: number;
  estimate: string;
  timeSpent?: string;
  status: string;
}

interface Column {
  id: string;
  title: string;
  status: string;
}

const columns: Column[] = [
  { id: 'backlog', title: 'Backlog', status: 'backlog' },
  { id: 'todo', title: 'To Do', status: 'todo' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
  { id: 'review', title: 'Review', status: 'review' },
  { id: 'done', title: 'Done', status: 'done' },
];

const priorityColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-purple-500',
};

export default function TasksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectSlug, setProjectSlug] = useState('');

  const fetchTasks = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${slug}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || data || []);
      }
    } catch {
      // silently fail — show empty columns
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    params.then(({ slug }) => {
      setProjectSlug(slug);
      fetchTasks(slug);
    });
  }, [params, fetchTasks]);

  const tasksByStatus = (status: string) =>
    tasks.filter((t) => t.status === status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage tasks across your project
          </p>
        </div>
        <Link href={`/projects/${projectSlug}/tasks/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </Link>
      </div>

      <ProjectNav projectSlug={projectSlug} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ListTodo className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No tasks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first task to start tracking work.
            </p>
            <Link href={`/projects/${projectSlug}/tasks/new`} className="mt-4">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnTasks = tasksByStatus(column.status);
            return (
              <div key={column.id} className="min-w-[280px] flex-1">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{column.title}</CardTitle>
                      <Badge variant="secondary">{columnTasks.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-lg border p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm">{task.title}</p>
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${priorityColors[task.priority] || 'bg-gray-400'}`}
                            />
                            <span className="text-muted-foreground">
                              P{task.priority}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            ~{task.estimate}
                            {task.timeSpent && ` (${task.timeSpent})`}
                          </span>
                        </div>
                      </div>
                    ))}
                    {columnTasks.length === 0 && (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        No tasks yet. Add your first task.
                      </p>
                    )}
                    <Link href={`/projects/${projectSlug}/tasks/new`}>
                      <Button variant="ghost" className="w-full" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
