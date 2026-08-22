'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, FolderKanban } from 'lucide-react';
import Link from 'next/link';

const colors = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Blue', value: '#3b82f6' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [repoUrl, setRepoUrl] = useState('');
  const [priority, setPriority] = useState('3');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Create project via API
    console.log({
      name,
      description,
      color,
      repoUrl,
      priority: parseInt(priority),
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);
    router.push('/projects');
  };

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="glass-card rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Project</h1>
          <p className="text-muted-foreground">
            Create a new project to track its lifecycle
          </p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/20 dark:border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
            <FolderKanban className="h-5 w-5 text-indigo-500" />
          </div>
          <h3 className="text-sm font-semibold">Project Details</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Project Name</Label>
            <Input
              id="name"
              placeholder="My Awesome Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-card border-white/20 dark:border-white/10 h-11"
              required
            />
            {name && (
              <p className="text-xs text-muted-foreground">
                Slug: /projects/{slug}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this project about? What problem does it solve?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="glass-card border-white/20 dark:border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Color</Label>
            <div className="flex gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`h-9 w-9 rounded-full transition-all shadow-sm ${
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-110 hover:shadow-md'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="repo" className="text-sm font-medium">GitHub Repository (optional)</Label>
            <Input
              id="repo"
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="glass-card border-white/20 dark:border-white/10 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v || '3')}>
              <SelectTrigger className="glass-card border-white/20 dark:border-white/10 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">★☆☆☆☆ Low</SelectItem>
                <SelectItem value="2">★★☆☆☆ Below Average</SelectItem>
                <SelectItem value="3">★★★☆☆ Normal</SelectItem>
                <SelectItem value="4">★★★★☆ High</SelectItem>
                <SelectItem value="5">★★★★★ Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Link href="/projects">
              <Button type="button" variant="outline" className="glass-card">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading || !name} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
