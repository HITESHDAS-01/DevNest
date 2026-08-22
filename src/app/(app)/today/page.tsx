'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  Play,
  SkipForward,
  Clock,
  Loader2,
  Sparkles,
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
  { bg: string; text: string; label: string; border: string }
> = {
  critical: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/20',
    label: 'Critical',
  },
  high: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
    label: 'High',
  },
  medium: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-500/20',
    label: 'Medium',
  },
  low: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
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
        <h1 className="text-2xl font-bold tracking-tight">What to Work On Today</h1>
        <p className="text-muted-foreground">
          AI-powered recommendations based on priorities, deadlines, and blockers
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : active.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl glass-card border border-white/20 dark:border-white/10 p-16 text-center">
          <div className="absolute inset-0 mesh-gradient opacity-40" />
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/10 to-orange-500/10 mx-auto mb-5">
              <Lightbulb className="h-8 w-8 text-yellow-500/50" />
            </div>
            <p className="font-medium text-lg">No recommendations yet</p>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm mx-auto">
              Add projects and tasks to get personalized suggestions for what to work on next.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Best Next Action */}
          {top && (
            <div className="relative overflow-hidden rounded-2xl glass-card border border-white/20 dark:border-white/10">
              <div className="absolute inset-0 mesh-gradient opacity-30" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <p className="font-semibold text-lg">Best Next Action</p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-3.5 w-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: top.projectColor }}
                      />
                      <span className="font-semibold text-lg">{top.taskTitle}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{top.reason}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-medium text-muted-foreground">
                        {top.project}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />~{top.estimate}
                      </div>
                      <Badge
                        className={cn(
                          'border',
                          urgencyConfig[top.urgency]?.bg,
                          urgencyConfig[top.urgency]?.text,
                          urgencyConfig[top.urgency]?.border
                        )}
                      >
                        {urgencyConfig[top.urgency]?.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25">
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass-card"
                      onClick={() => handleSkip(top.id)}
                    >
                      <SkipForward className="mr-2 h-4 w-4" />
                      Skip
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Recommendations */}
          {rest.length > 0 && (
            <div className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Other Priorities</p>
              <div className="space-y-2">
                {rest.map((rec, i) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 dark:border-white/5 glass-card p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                        {i + 2}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate text-sm">
                            {rec.taskTitle}
                          </span>
                          <div
                            className="h-2 w-2 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: rec.projectColor }}
                          />
                          <span className="text-xs text-muted-foreground shrink-0">
                            {rec.project}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
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
                          'border text-[11px]',
                          urgencyConfig[rec.urgency]?.bg,
                          urgencyConfig[rec.urgency]?.text,
                          urgencyConfig[rec.urgency]?.border
                        )}
                      >
                        {urgencyConfig[rec.urgency]?.label}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="glass-card"
                        onClick={() => handleSkip(rec.id)}
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
