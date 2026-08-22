'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  StickyNote,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'file' | 'doc';
  notes: string;
  createdAt: string;
}

const typeConfig: Record<
  string,
  { icon: typeof LinkIcon; color: string; label: string }
> = {
  link: { icon: LinkIcon, color: 'bg-blue-100 text-blue-700', label: 'Link' },
  file: {
    icon: FolderOpen,
    color: 'bg-orange-100 text-orange-700',
    label: 'File',
  },
  doc: {
    icon: FileText,
    color: 'bg-green-100 text-green-700',
    label: 'Doc',
  },
};

const typeOptions = ['link', 'file', 'doc'] as const;
type ResourceType = 'link' | 'file' | 'doc';

const demoResources: Resource[] = [
  {
    id: '1',
    title: 'TaskFlow API Spec (OpenAPI)',
    url: 'https://docs.example.com/taskflow/api',
    type: 'doc',
    notes: 'Full OpenAPI 3.1 specification for the TaskFlow REST API',
    createdAt: '2026-02-10',
  },
  {
    id: '2',
    title: 'Auth middleware reference',
    url: 'https://github.com/example/auth-middleware',
    type: 'link',
    notes: 'Reference implementation for JWT-based auth middleware',
    createdAt: '2026-02-08',
  },
  {
    id: '3',
    title: 'Database schema diagram',
    url: '/files/schema-v2.png',
    type: 'file',
    notes: 'Visual diagram of the v2 database schema with relationships',
    createdAt: '2026-02-05',
  },
  {
    id: '4',
    title: 'Rate limiting design doc',
    url: 'https://docs.example.com/rate-limiting',
    type: 'doc',
    notes: 'Design decisions for token-bucket rate limiting implementation',
    createdAt: '2026-01-28',
  },
  {
    id: '5',
    title: 'CI/CD pipeline config',
    url: 'https://github.com/example/taskflow/blob/main/.github/workflows/deploy.yml',
    type: 'link',
    notes: 'GitHub Actions workflow for build, test, and deploy',
    createdAt: '2026-01-20',
  },
];

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
  const [resources, setResources] = useState<Resource[]>(demoResources);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setResources((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, title: form.title, url: form.url, type: form.type, notes: form.notes }
            : r
        )
      );
    } else {
      const newResource: Resource = {
        id: Date.now().toString(),
        title: form.title,
        url: form.url,
        type: form.type,
        notes: form.notes,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setResources((prev) => [newResource, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      setResources((prev) => prev.filter((r) => r.id !== id));
      setDeletingId(null);
    }, 200);
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

      <ProjectNav projectSlug="demo-project" />

      {resources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No resources yet. Save your first link or document.
            </p>
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
                      <span className="font-medium truncate">
                        {resource.title}
                      </span>
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
              <Button type="submit">
                {editingId ? 'Update' : 'Add Resource'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
