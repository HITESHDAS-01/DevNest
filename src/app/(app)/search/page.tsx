'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search as SearchIcon,
  FolderKanban,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'note' | 'decision';
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
}

const typeConfig: Record<
  string,
  { icon: typeof FolderKanban; gradient: string; label: string }
> = {
  project: { icon: FolderKanban, gradient: 'from-indigo-500 to-purple-600', label: 'Project' },
  task: { icon: FileText, gradient: 'from-red-500 to-orange-600', label: 'Task' },
  note: { icon: FileText, gradient: 'from-blue-500 to-cyan-600', label: 'Note' },
  decision: { icon: Lightbulb, gradient: 'from-purple-500 to-pink-600', label: 'Decision' },
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => performSearch(value), 300);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const grouped = results.reduce(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type].push(r);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  const typeOrder = ['project', 'task', 'note', 'decision'] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">
          Search across all your projects, tasks, notes, and decisions
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects, tasks, notes, decisions..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className="h-12 pl-12 text-base glass-card border-white/20 dark:border-white/10 rounded-xl"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {!searched && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mb-5">
            <Sparkles className="h-8 w-8 text-indigo-500/40" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-1">
            Type to search
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Find anything across your projects, tasks, notes, and architectural decisions
          </p>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-72 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-5">
            <SearchIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-1">
            No results found
          </h2>
          <p className="text-sm text-muted-foreground">
            Try a different search term or check your spelling
          </p>
        </div>
      )}

      {!loading && searched && results.length > 0 && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          {typeOrder.map((type) => {
            const items = grouped[type];
            if (!items || items.length === 0) return null;
            const config = typeConfig[type];
            const Icon = config.icon;
            return (
              <div key={type} className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {config.label}s{' '}
                  <span className="text-muted-foreground/60">
                    ({items.length})
                  </span>
                </h3>
                <div className="space-y-2">
                  {items.map((result) => (
                    <div
                      key={result.id}
                      className="glass-card rounded-xl border border-white/20 dark:border-white/10 p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-sm`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {result.title}
                            </span>
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-[11px] border"
                            >
                              {config.label}
                            </Badge>
                          </div>
                          {result.description && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {result.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
