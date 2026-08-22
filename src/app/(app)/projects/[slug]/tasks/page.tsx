'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectNav } from '@/components/project/project-nav';
import { Plus, GripVertical } from 'lucide-react';

// Demo data
const columns = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      { id: '1', title: 'Add search functionality', priority: 3, estimate: '6h', timeSpent: '' },
      { id: '2', title: 'Implement webhooks', priority: 2, estimate: '8h', timeSpent: '' },
    ],
  },
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: '3', title: 'Fix auth middleware', priority: 1, estimate: '2h', timeSpent: '' },
      { id: '4', title: 'Write API documentation', priority: 2, estimate: '3h', timeSpent: '' },
    ],
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    tasks: [
      { id: '5', title: 'Add rate limiting', priority: 1, estimate: '4h', timeSpent: '2h' },
      { id: '6', title: 'Write integration tests', priority: 2, estimate: '5h', timeSpent: '1h' },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [
      { id: '7', title: 'Update dependencies', priority: 3, estimate: '1h', timeSpent: '' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: '8', title: 'Setup CI pipeline', priority: 1, estimate: '2h', timeSpent: '' },
      { id: '9', title: 'Database schema', priority: 1, estimate: '3h', timeSpent: '' },
      { id: '10', title: 'Auth v1', priority: 1, estimate: '8h', timeSpent: '' },
    ],
  },
];

const priorityColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-purple-500',
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage tasks across your project
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <ProjectNav projectSlug="taskflow" />

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="min-w-[280px] flex-1">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{column.title}</CardTitle>
                  <Badge variant="secondary">{column.tasks.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {column.tasks.map((task) => (
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
                          className={`h-2 w-2 rounded-full ${priorityColors[task.priority]}`}
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
                <Button variant="ghost" className="w-full" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
