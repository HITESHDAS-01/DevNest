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
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Wrench,
  Bug,
  Sparkles,
  FileText,
  RefreshCw,
  Circle,
} from 'lucide-react';

interface MaintenanceItem {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'improvement' | 'debt' | 'docs' | 'update';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

const PROJECT_ID = 'demo-project';
const typeOptions = ['bug', 'improvement', 'debt', 'docs', 'update'] as const;
const statusOptions = ['open', 'in_progress', 'resolved'] as const;

const typeColors: Record<string, string> = {
  bug: 'bg-red-100 text-red-800',
  improvement: 'bg-blue-100 text-blue-800',
  debt: 'bg-orange-100 text-orange-800',
  docs: 'bg-green-100 text-green-800',
  update: 'bg-purple-100 text-purple-800',
};

const typeLabels: Record<string, string> = {
  bug: 'Bug',
  improvement: 'Improvement',
  debt: 'Tech Debt',
  docs: 'Docs',
  update: 'Update',
};

const typeIcons: Record<string, typeof Bug> = {
  bug: Bug,
  improvement: Sparkles,
  debt: Wrench,
  docs: FileText,
  update: RefreshCw,
};

const statusColors: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

type MaintenanceType = 'bug' | 'improvement' | 'debt' | 'docs' | 'update';
type MaintenanceStatus = 'open' | 'in_progress' | 'resolved';

const emptyForm: {
  title: string;
  description: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
} = {
  title: '',
  description: '',
  type: 'bug',
  status: 'open',
};

export default function MaintenancePage({ params }: { params: Promise<{ slug: string }> }) {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${PROJECT_ID}/maintenance`);
      if (!res.ok) throw new Error('Failed to fetch maintenance items');
      const data = await res.json();
      setItems(data.maintenance || data || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load maintenance items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = items.filter(
    (item) =>
      (typeFilter === 'all' || item.type === typeFilter) &&
      (statusFilter === 'all' || item.status === statusFilter)
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: MaintenanceItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      type: item.type as MaintenanceType,
      status: item.status as MaintenanceStatus,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `/api/projects/${PROJECT_ID}/maintenance/${editingId}`
        : `/api/projects/${PROJECT_ID}/maintenance`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      setDialogOpen(false);
      fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (item: MaintenanceItem) => {
    const newStatus = item.status === 'resolved' ? 'open' : 'resolved';
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/maintenance/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this maintenance item?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/maintenance/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchItems();
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
          <h1 className="text-2xl font-bold">Maintenance</h1>
          <p className="text-muted-foreground">Bugs, improvements, tech debt, and updates</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <ProjectNav projectSlug="demo-project" />

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Type:</span>
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            All
          </Button>
          {typeOptions.map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(t)}
            >
              {typeLabels[t]}
            </Button>
          ))}
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
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
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading maintenance items...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="mb-3 h-10 w-10 text-green-500/50" />
            <p className="text-muted-foreground">
              {typeFilter === 'all' && statusFilter === 'all'
                ? 'No maintenance items. Your project is clean!'
                : 'No items match the selected filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <Card key={item.id}>
                <CardContent className="flex items-start gap-4 py-4">
                  <div className="mt-1">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-medium ${
                          item.status === 'resolved'
                            ? 'text-muted-foreground line-through'
                            : ''
                        }`}
                      >
                        {item.title}
                      </h3>
                      <Badge className={typeColors[item.type]}>{typeLabels[item.type]}</Badge>
                      <Badge className={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleResolve(item)}>
                      {item.status === 'resolved' ? (
                        <>
                          <Circle className="mr-1 h-3 w-3" />
                          Reopen
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Resolve
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      {deletingId === item.id ? '...' : 'Delete'}
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
            <DialogTitle>
              {editingId ? 'Edit Maintenance Item' : 'Add Maintenance Item'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the maintenance item details below.'
                : 'Track a new bug, improvement, or maintenance task.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Item title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue or improvement"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as MaintenanceType })
                  }
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {typeLabels[t]}
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
                    setForm({ ...form, status: e.target.value as MaintenanceStatus })
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
