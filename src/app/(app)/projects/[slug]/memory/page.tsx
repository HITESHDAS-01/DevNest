'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProjectNav } from '@/components/project/project-nav';
import { Pencil, Save, BookOpen } from 'lucide-react';
import { useState } from 'react';

// Demo data
const memory = {
  purpose:
    'TaskFlow is a lightweight task management API built for small teams (2-5 people) who need a simple way to track tasks without the overhead of tools like Jira.',
  problem:
    'Small teams often struggle with task management. Sticky notes are too simple, Jira is too complex. TaskFlow bridges this gap with a clean API and minimal UI.',
  decisions:
    `1. **PostgreSQL over MongoDB** — Relational data fits task management perfectly. Tasks have clear relationships to milestones, projects, and users.

2. **REST over GraphQL** — For this scope, REST is simpler to implement and consume. No need for flexible queries when the data model is well-defined.

3. **Redis for caching** — Session management and rate limiting both need fast in-memory storage. Redis handles both elegantly.

4. **Monolith first** — Avoid premature microservice complexity. A well-structured monolith can be split later if needed.`,
  knownIssues:
    `- Rate limiter not implemented yet (blocking production use)
- Auth middleware has edge case with expired tokens on Safari
- No pagination on list endpoints (will break with large datasets)
- Error messages not standardized across endpoints`,
  futurePlans:
    `- Real-time updates via WebSocket
- File attachments on tasks
- Mobile app (React Native)
- Webhook integrations for Slack/Discord
- Multi-workspace support
- Time tracking with reports`,
};

export default function MemoryPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMemory, setEditedMemory] = useState(memory);

  const handleSave = () => {
    // TODO: Save via API
    setIsEditing(false);
  };

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
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      </div>

      <ProjectNav projectSlug="taskflow" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Purpose */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Purpose</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>Why does this project exist?</Label>
                <Textarea
                  value={editedMemory.purpose}
                  onChange={(e) =>
                    setEditedMemory({ ...editedMemory, purpose: e.target.value })
                  }
                  rows={4}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{memory.purpose}</p>
            )}
          </CardContent>
        </Card>

        {/* Problem */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Problem It Solves</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>What problem does this solve?</Label>
                <Textarea
                  value={editedMemory.problem}
                  onChange={(e) =>
                    setEditedMemory({ ...editedMemory, problem: e.target.value })
                  }
                  rows={4}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{memory.problem}</p>
            )}
          </CardContent>
        </Card>

        {/* Decisions */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Key Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>Important technical and design decisions</Label>
                <Textarea
                  value={editedMemory.decisions}
                  onChange={(e) =>
                    setEditedMemory({ ...editedMemory, decisions: e.target.value })
                  }
                  rows={8}
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {memory.decisions}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Known Issues */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Known Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>Current problems and limitations</Label>
                <Textarea
                  value={editedMemory.knownIssues}
                  onChange={(e) =>
                    setEditedMemory({
                      ...editedMemory,
                      knownIssues: e.target.value,
                    })
                  }
                  rows={6}
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {memory.knownIssues}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future Plans */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Future Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>What's planned for the future?</Label>
                <Textarea
                  value={editedMemory.futurePlans}
                  onChange={(e) =>
                    setEditedMemory({
                      ...editedMemory,
                      futurePlans: e.target.value,
                    })
                  }
                  rows={6}
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {memory.futurePlans}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
