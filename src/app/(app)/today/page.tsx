'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  Play,
  SkipForward,
  Clock,
  Loader2,
} from 'lucide-react';

interface Recommendation {
  id: string;
  taskTitle: string;
  project: string;
  projectColor: string;
  priority: number;
  estimate: string;
  reason: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

const urgencyConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  critical: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    label: 'Critical',
  },
  high: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    label: 'High',
  },
  medium: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    label: 'Medium',
  },
  low: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    label: 'Low',
  },
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function TodayPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [skipped, setSkipped] = useState<string[]>([]);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || data || []);
      }
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const active = recommendations.filter((r) => !skipped.includes(r.id));
  const top = active[0];
  const rest = active.slice(1);

  const handleSkip = (id: string) => {
    setSkipped((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">What to Work On Today</h1>
        <p className="text-muted-foreground">
          AI-powered recommendations based on priorities, deadlines, and
          blockers
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : active.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Lightbulb className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No recommendations yet</p>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
              Add projects and tasks to get personalized suggestions for what to work on next.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Best Next Action */}
          {top && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Best Next Action</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: top.projectColor }}
                      />
                      <span className="font-semibold text-lg">{top.taskTitle}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{top.reason}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-medium text-muted-foreground">
                        {top.project}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />~{top.estimate}
                      </div>
                      <Badge
                        className={cn(
                          urgencyConfig[top.urgency]?.bg,
                          urgencyConfig[top.urgency]?.text
                        )}
                      >
                        {urgencyConfig[top.urgency]?.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="lg">
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => handleSkip(top.id)}
                    >
                      <SkipForward className="mr-2 h-4 w-4" />
                      Skip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other Recommendations */}
          {rest.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Other Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rest.map((rec, i) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                          {i + 2}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {rec.taskTitle}
                            </span>
                            <div
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: rec.projectColor }}
                            />
                            <span className="text-xs text-muted-foreground shrink-0">
                              {rec.project}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {rec.reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />~{rec.estimate}
                        </div>
                        <Badge
                          className={cn(
                            urgencyConfig[rec.urgency]?.bg,
                            urgencyConfig[rec.urgency]?.text
                          )}
                        >
                          {urgencyConfig[rec.urgency]?.label}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSkip(rec.id)}
                        >
                          Skip
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
