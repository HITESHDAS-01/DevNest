'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Search, FolderKanban, Lightbulb, Plus, Calendar, Settings } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    command();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl">
        <Command className="rounded-2xl">
          <div className="flex items-center border-b border-white/10 dark:border-white/5 px-4">
            <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Search projects, tasks, notes..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/dashboard'))}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm cursor-pointer hover:bg-indigo-500/10 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10">
                  <FolderKanban className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                Dashboard
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/projects'))}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm cursor-pointer hover:bg-indigo-500/10 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10">
                  <FolderKanban className="h-3.5 w-3.5 text-purple-500" />
                </div>
                View all projects
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/timeline'))}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm cursor-pointer hover:bg-indigo-500/10 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                </div>
                Timeline
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Quick Actions">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/projects/new'))}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm cursor-pointer hover:bg-indigo-500/10 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10">
                  <Plus className="h-3.5 w-3.5 text-green-500" />
                </div>
                Create new project
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/today'))}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm cursor-pointer hover:bg-indigo-500/10 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                </div>
                What to work on next?
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/settings'))}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm cursor-pointer hover:bg-indigo-500/10 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-500/10">
                  <Settings className="h-3.5 w-3.5 text-gray-500" />
                </div>
                Settings
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
