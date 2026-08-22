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
  AlertTriangle,
  Circle,
} from 'lucide-react';

interface Blocker {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

const PROJECT_ID = 'demo-project';
const severityOptions = ['low', 'medium', 'high', 'critical'] as const;
const statusFilterOptions = ['all', 'open', 'resolved'] as const;

const severityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const severityIcons: Record<string, string> = {
  low: '○',
  medium: '◐',
  high: '●',
  critical: '◉',
};

type BlockerSeverity = 'low' | 'medium' | 'high' | 'critical';

const emptyForm: {
  title: string;
  description: string;
  severity: BlockerSeverity;
} = {
  title: '',
  description: '',
  severity: 'medium',
};

export default function BlockersPage({ params }: { params: Promise<{ slug: string }> }) {
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBlockers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${PROJECT_ID}/blockers`);
      if (!res.ok) throw new Error('Failed to fetch blockers');
      const data = await res.json();
      setBlockers(data.blockers || data || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load blockers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockers();
  }, [fetchBlockers]);

  const filtered = blockers.filter(
    (b) => statusFilter === 'all' || b.status === statusFilter
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (b: Blocker) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      description: b.description,
      severity: b.severity,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `/api/projects/${PROJECT_ID}/blockers/${editingId}`
        : `/api/projects/${PROJECT_ID}/blockers`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save blocker');
      setDialogOpen(false);
      fetchBlockers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (b: Blocker) => {
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/blockers/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: b.status === 'resolved' ? 'open' : 'resolved',
        }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchBlockers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blocker?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/blockers/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchBlockers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const openCount = blockers.filter((b) => b.status === 'open').length;
  const resolvedCount = blockers.filter((b) => b.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blockers</h1>
          <p className="text-muted-foreground">Track and resolve project blockers</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Blocker
        </Button>
      </div>

      <ProjectNav projectSlug="demo-project" />

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex items-center gap-3">
        {statusFilterOptions.map((opt) => (
          <Button
            key={opt}
            variant={statusFilter === opt ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(opt)}
          >
            {opt === 'all' && `All (${blockers.length})`}
            {opt === 'open' && `Open (${openCount})`}
            {opt === 'resolved' && `Resolved (${resolvedCount})`}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading blockers...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="mb-3 h-10 w-10 text-green-500/50" />
            <p className="text-muted-foreground">
              {statusFilter === 'all'
                ? 'No blockers yet. Great!'
                : `No ${statusFilter} blockers.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{severityIcons[b.severity]}</span>
                    <h3
                      className={`font-medium ${
                        b.status === 'resolved' ? 'text-muted-foreground line-through' : ''
                      }`}
                    >
                      {b.title}
                    </h3>
                  </div>
                  {b.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{b.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge className={severityColors[b.severity]}>{b.severity}</Badge>
                    <Badge variant={b.status === 'resolved' ? 'default' : 'outline'}>
                      {b.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleResolve(b)}>
                    {b.status === 'resolved' ? (
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
                  <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    {deletingId === b.id ? '...' : 'Delete'}
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
            <DialogTitle>{editingId ? 'Edit Blocker' : 'Add Blocker'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the blocker details below.'
                : 'Report a new blocker to track and resolve.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Blocker title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the blocker and its impact"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value as BlockerSeverity })
                  }
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {severityOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
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
