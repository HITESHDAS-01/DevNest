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
  GitBranch,
  CheckCircle2,
  Circle,
} from 'lucide-react';

interface Decision {
  id: string;
  title: string;
  context: string;
  options: string[];
  chosenOption: string;
  rationale: string;
  createdAt: string;
}

const PROJECT_ID = 'demo-project';

const emptyForm = {
  title: '',
  context: '',
  options: '',
  chosenOption: '',
  rationale: '',
};

export default function DecisionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDecisions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${PROJECT_ID}/decisions`);
      if (!res.ok) throw new Error('Failed to fetch decisions');
      const data = await res.json();
      setDecisions(data.decisions || data || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load decisions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (d: Decision) => {
    setEditingId(d.id);
    setForm({
      title: d.title,
      context: d.context,
      options: d.options.join('\n'),
      chosenOption: d.chosenOption,
      rationale: d.rationale,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        title: form.title,
        context: form.context,
        options: form.options
          .split('\n')
          .map((o) => o.trim())
          .filter(Boolean),
        chosenOption: form.chosenOption,
        rationale: form.rationale,
      };
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `/api/projects/${PROJECT_ID}/decisions/${editingId}`
        : `/api/projects/${PROJECT_ID}/decisions`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save decision');
      setDialogOpen(false);
      fetchDecisions();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this decision?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/decisions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchDecisions();
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
          <h1 className="text-2xl font-bold">Decisions</h1>
          <p className="text-muted-foreground">Architecture decisions and rationale log</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Log Decision
        </Button>
      </div>

      <ProjectNav projectSlug="demo-project" />

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading decisions...</div>
      ) : decisions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">No decisions logged yet. Record your first decision.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {decisions.map((d) => (
            <Card key={d.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GitBranch className="h-4 w-4 text-primary" />
                    {d.title}
                  </CardTitle>
                  <Badge variant="secondary">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {d.context && (
                  <div>
                    <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      Context
                    </h4>
                    <p className="text-sm text-muted-foreground">{d.context}</p>
                  </div>
                )}

                {d.options.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      Options Considered
                    </h4>
                    <div className="space-y-1">
                      {d.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {opt === d.chosenOption ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                          )}
                          <span
                            className={
                              opt === d.chosenOption
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground'
                            }
                          >
                            {opt}
                          </span>
                          {opt === d.chosenOption && (
                            <Badge variant="default" className="text-xs">
                              Chosen
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {d.rationale && (
                  <div>
                    <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      Rationale
                    </h4>
                    <p className="text-sm text-muted-foreground">{d.rationale}</p>
                  </div>
                )}

                <Separator />
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(d.id)}
                    disabled={deletingId === d.id}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    {deletingId === d.id ? '...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Decision' : 'Log Decision'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the decision details below.'
                : 'Record a new architecture decision with context and rationale.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Decision Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Use PostgreSQL for primary database"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Context</Label>
              <Textarea
                id="context"
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                placeholder="Why is this decision needed? What constraints exist?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="options">Options (one per line)</Label>
              <Textarea
                id="options"
                value={form.options}
                onChange={(e) => setForm({ ...form, options: e.target.value })}
                placeholder="PostgreSQL&#10;MySQL&#10;MongoDB"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chosenOption">Chosen Option</Label>
              <Input
                id="chosenOption"
                value={form.chosenOption}
                onChange={(e) => setForm({ ...form, chosenOption: e.target.value })}
                placeholder="Which option was selected"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rationale">Rationale</Label>
              <Textarea
                id="rationale"
                value={form.rationale}
                onChange={(e) => setForm({ ...form, rationale: e.target.value })}
                placeholder="Why was this option chosen?"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Log Decision'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
