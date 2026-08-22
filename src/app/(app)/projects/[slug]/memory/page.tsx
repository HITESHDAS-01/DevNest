'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProjectNav } from '@/components/project/project-nav';
import { Pencil, Save, BookOpen, Loader2 } from 'lucide-react';

interface Memory {
  purpose: string;
  problem: string;
  decisions: string;
  knownIssues: string;
  futurePlans: string;
}

const emptyMemory: Memory = {
  purpose: '',
  problem: '',
  decisions: '',
  knownIssues: '',
  futurePlans: '',
};

const PROJECT_ID = 'demo-project';

export default function MemoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [memory, setMemory] = useState<Memory>(emptyMemory);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [projectSlug, setProjectSlug] = useState('');

  useEffect(() => {
    params.then(({ slug }) => setProjectSlug(slug));
  }, [params]);

  const fetchMemory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${PROJECT_ID}/memory`);
      if (res.ok) {
        const data = await res.json();
        setMemory({
          purpose: data.purpose || '',
          problem: data.problem || '',
          decisions: data.decisions || '',
          knownIssues: data.knownIssues || '',
          futurePlans: data.futurePlans || '',
        });
      }
      setError('');
    } catch {
      // show empty fields on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/memory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory),
      });
      if (!res.ok) throw new Error('Failed to save');
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <div>
            <h1 className="text-2xl font-bold">Project Memory</h1>
            <p className="text-muted-foreground">
              Preserved context and decisions for this project
            </p>
          </div>
        </div>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={saving}
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      </div>

      <ProjectNav projectSlug={projectSlug} />

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Purpose</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>Why does this project exist?</Label>
                <Textarea
                  value={memory.purpose}
                  onChange={(e) =>
                    setMemory({ ...memory, purpose: e.target.value })
                  }
                  rows={4}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {memory.purpose || (
                  <span className="italic">No purpose defined yet. Click Edit to add one.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Problem It Solves</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>What problem does this solve?</Label>
                <Textarea
                  value={memory.problem}
                  onChange={(e) =>
                    setMemory({ ...memory, problem: e.target.value })
                  }
                  rows={4}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {memory.problem || (
                  <span className="italic">No problem statement defined yet.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Key Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>Important technical and design decisions</Label>
                <Textarea
                  value={memory.decisions}
                  onChange={(e) =>
                    setMemory({ ...memory, decisions: e.target.value })
                  }
                  rows={8}
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {memory.decisions || (
                  <span className="italic">No decisions recorded yet.</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Known Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>Current problems and limitations</Label>
                <Textarea
                  value={memory.knownIssues}
                  onChange={(e) =>
                    setMemory({ ...memory, knownIssues: e.target.value })
                  }
                  rows={6}
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {memory.knownIssues || (
                  <span className="italic">No known issues recorded.</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Future Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>What&apos;s planned for the future?</Label>
                <Textarea
                  value={memory.futurePlans}
                  onChange={(e) =>
                    setMemory({ ...memory, futurePlans: e.target.value })
                  }
                  rows={6}
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {memory.futurePlans || (
                  <span className="italic">No future plans recorded.</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
