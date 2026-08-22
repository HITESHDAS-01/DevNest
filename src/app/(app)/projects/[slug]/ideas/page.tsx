'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ProjectNav } from '@/components/project/project-nav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Lightbulb, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  description: string;
  priority: number;
  effort: string;
  status: 'backlog' | 'considering' | 'planned' | 'doing' | 'done' | 'dropped';
  createdAt: string;
}

const PROJECT_ID = 'demo-project';
const statusOptions = ['backlog', 'considering', 'planned', 'doing', 'done', 'dropped'] as const;
const effortOptions = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const statusColors: Record<string, string> = {
  backlog: 'bg-gray-100 text-gray-800',
  considering: 'bg-blue-100 text-blue-800',
  planned: 'bg-purple-100 text-purple-800',
  doing: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
  dropped: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  backlog: 'Backlog',
  considering: 'Considering',
  planned: 'Planned',
  doing: 'Doing',
  done: 'Done',
  dropped: 'Dropped',
};

const effortLabels: Record<string, string> = {
  xs: 'XS (< 1h)',
  sm: 'SM (1-4h)',
  md: 'MD (1-2d)',
  lg: 'LG (3-5d)',
  xl: 'XL (1w+)',
};

type IdeaStatus = 'backlog' | 'considering' | 'planned' | 'doing' | 'done' | 'dropped';
type IdeaEffort = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const emptyForm: {
  title: string;
  description: string;
  priority: number;
  effort: IdeaEffort;
  status: IdeaStatus;
} = {
  title: '',
  description: '',
  priority: 3,
  effort: 'md',
  status: 'backlog',
};

export default function IdeasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectSlug, setProjectSlug] = useState('');

  useEffect(() => {
    params.then(({ slug }) => setProjectSlug(slug));
  }, [params]);

  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${PROJECT_ID}/ideas`);
      if (!res.ok) throw new Error('Failed to fetch ideas');
      const data = await res.json();
      setIdeas(data.ideas || data || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load ideas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const sortedIdeas = [...ideas]
    .filter((i) => statusFilter === 'all' || i.status === statusFilter)
    .sort((a, b) => a.priority - b.priority);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (idea: Idea) => {
    setEditingId(idea.id);
    setForm({
      title: idea.title,
      description: idea.description,
      priority: idea.priority,
      effort: idea.effort as IdeaEffort,
      status: idea.status as IdeaStatus,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `/api/projects/${PROJECT_ID}/ideas/${editingId}`
        : `/api/projects/${PROJECT_ID}/ideas`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save idea');
      setDialogOpen(false);
      fetchIdeas();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePriorityChange = async (idea: Idea, direction: 'up' | 'down') => {
    const newPriority = direction === 'up' ? Math.max(1, idea.priority - 1) : idea.priority + 1;
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (!res.ok) throw new Error('Failed to update priority');
      fetchIdeas();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this idea?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/ideas/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchIdeas();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ideas</h1>
          <p className="text-muted-foreground">Ideas parking lot and feature requests</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Idea
        </Button>
      </div>

      <ProjectNav projectSlug={projectSlug} />

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All
        </Button>
        {statusOptions.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {statusLabels[s]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sortedIdeas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Lightbulb className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">
              {statusFilter === 'all'
                ? 'No ideas yet'
                : `No ideas with status "${statusLabels[statusFilter]}"`}
            </p>
            {statusFilter === 'all' && (
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first idea or feature request.
              </p>
            )}
            {statusFilter === 'all' && (
              <Button size="sm" className="mt-4" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Idea
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedIdeas.map((idea) => (
            <Card key={idea.id}>
              <CardContent className="flex items-start gap-4 py-4">
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handlePriorityChange(idea, 'up')}
                    disabled={idea.priority <= 1}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {idea.priority}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handlePriorityChange(idea, 'down')}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{idea.title}</h3>
                    <Badge className={statusColors[idea.status]}>{statusLabels[idea.status]}</Badge>
                  </div>
                  {idea.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Effort: {effortLabels[idea.effort] || idea.effort}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(idea)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(idea.id)}
                    disabled={deletingId === idea.id}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    {deletingId === idea.id ? '...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Idea' : 'Add Idea'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the idea details below.'
                : 'Capture a new idea or feature request.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Idea title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the idea"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min={1}
                  max={20}
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effort">Effort</Label>
                <select
                  id="effort"
                  value={form.effort}
                  onChange={(e) =>
                    setForm({ ...form, effort: e.target.value as IdeaEffort })
                  }
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {effortOptions.map((e) => (
                    <option key={e} value={e}>
                      {e.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as IdeaStatus })
                  }
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add Idea'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
