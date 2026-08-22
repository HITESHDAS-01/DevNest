'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ProjectNav } from '@/components/project/project-nav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Calendar, Target, Loader2 } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
}

const PROJECT_ID = 'demo-project';
const statusOptions = ['pending', 'in_progress', 'completed'] as const;

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

type MilestoneStatus = 'pending' | 'in_progress' | 'completed';

const emptyForm: {
  title: string;
  description: string;
  targetDate: string;
  status: MilestoneStatus;
} = {
  title: '',
  description: '',
  targetDate: '',
  status: 'pending',
};

export default function MilestonesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectSlug, setProjectSlug] = useState('');

  useEffect(() => {
    params.then(({ slug }) => setProjectSlug(slug));
  }, [params]);

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${PROJECT_ID}/milestones`);
      if (!res.ok) throw new Error('Failed to fetch milestones');
      const data = await res.json();
      setMilestones(data.milestones || data || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load milestones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (m: Milestone) => {
    setEditingId(m.id);
    setForm({
      title: m.title,
      description: m.description,
      targetDate: m.targetDate?.split('T')[0] || '',
      status: m.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `/api/projects/${PROJECT_ID}/milestones/${editingId}`
        : `/api/projects/${PROJECT_ID}/milestones`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save milestone');
      setDialogOpen(false);
      fetchMilestones();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this milestone?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/milestones/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchMilestones();
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
          <h1 className="text-2xl font-bold">Milestones</h1>
          <p className="text-muted-foreground">Track project milestones and deadlines</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      <ProjectNav projectSlug={projectSlug} />

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : milestones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No milestones yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first milestone to track progress.
            </p>
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {milestones.map((m) => {
            const progress =
              m.taskCount > 0 ? Math.round((m.completedTaskCount / m.taskCount) * 100) : 0;
            return (
              <Card key={m.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{m.title}</CardTitle>
                    <Badge className={statusColors[m.status]}>{statusLabels[m.status]}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {m.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                  )}
                  {m.targetDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(m.targetDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{m.completedTaskCount}/{m.taskCount} tasks</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      {deletingId === m.id ? '...' : 'Delete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Milestone' : 'Create Milestone'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the milestone details below.'
                : 'Add a new milestone to track progress.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Milestone title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as MilestoneStatus })
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
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
