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
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  FolderOpen,
  Loader2,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'file' | 'doc';
  notes: string;
  createdAt: string;
}

const PROJECT_ID = 'demo-project';

const typeConfig: Record<
  string,
  { icon: typeof LinkIcon; color: string; label: string }
> = {
  link: { icon: LinkIcon, color: 'bg-blue-100 text-blue-700', label: 'Link' },
  file: { icon: FolderOpen, color: 'bg-orange-100 text-orange-700', label: 'File' },
  doc: { icon: FileText, color: 'bg-green-100 text-green-700', label: 'Doc' },
};

const typeOptions = ['link', 'file', 'doc'] as const;
type ResourceType = 'link' | 'file' | 'doc';

const emptyForm: {
  title: string;
  url: string;
  type: ResourceType;
  notes: string;
} = {
  title: '',
  url: '',
  type: 'link',
  notes: '',
};

export default function ResourcesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [resources, setResources] = useState<Resource[]>([]);
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

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${PROJECT_ID}/resources`);
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setResources(data.resources || data || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (r: Resource) => {
    setEditingId(r.id);
    setForm({
      title: r.title,
      url: r.url,
      type: r.type,
      notes: r.notes,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `/api/projects/${PROJECT_ID}/resources/${editingId}`
        : `/api/projects/${PROJECT_ID}/resources`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save resource');
      setDialogOpen(false);
      fetchResources();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/resources/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchResources();
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
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-muted-foreground">
            Saved links, documents, and files for this project
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
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
      ) : resources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No resources saved yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Save links, files, and documents for easy access.
            </p>
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {resources.map((resource) => {
            const config = typeConfig[resource.type];
            const Icon = config.icon;
            return (
              <Card
                key={resource.id}
                className="transition-colors hover:bg-muted/30"
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{resource.title}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {config.label}
                      </Badge>
                    </div>
                    {resource.notes && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {resource.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-xs"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {resource.url}
                      </a>
                      <span className="text-xs text-muted-foreground">
                        {resource.createdAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEdit(resource)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(resource.id)}
                      disabled={deletingId === resource.id}
                    >
                      <Trash2 className="h-3 w-3" />
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
              {editingId ? 'Edit Resource' : 'Add Resource'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the resource details below.'
                : 'Save a link, file, or document for this project.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="res-title">Title</Label>
              <Input
                id="res-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Resource title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="res-url">URL</Label>
              <Input
                id="res-url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="res-type">Type</Label>
              <select
                id="res-type"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as ResourceType })
                }
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="res-notes">Notes</Label>
              <Textarea
                id="res-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes about this resource"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add Resource'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
