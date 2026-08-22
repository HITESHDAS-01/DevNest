'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Search,
  Settings,
  Plus,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Timeline', href: '/timeline', icon: Calendar },
  { name: 'Today', href: '/today', icon: Lightbulb },
  { name: 'Search', href: '/search', icon: Search },
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col glass-nav border-r border-white/10 dark:border-white/5">
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-white/10 dark:border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
          <span className="text-base">🪹</span>
        </div>
        <span className="font-bold text-lg tracking-tight">DevNest</span>
      </div>

      <div className="px-3 py-3">
        <Link href="/projects/new">
          <Button className="w-full justify-start gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all" size="sm">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-4 w-4', isActive && 'text-indigo-500 dark:text-indigo-400')} />
              {item.name}
              {item.name === 'Today' && (
                <span className="ml-auto inline-flex items-center rounded-full bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-600 dark:text-yellow-400">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3">
        <div className="glass-card rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm">
              <Zap className="h-3 w-3 text-white" />
            </div>
            Quick Actions
          </div>
          <div className="mt-2.5 space-y-1">
            <Link
              href="/today"
              className="block rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground transition-colors"
            >
              → What to work on next?
            </Link>
            <Link
              href="/projects/new"
              className="block rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground transition-colors"
            >
              → Create new project
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 dark:border-white/5">
        <nav className="space-y-1 px-3 py-3">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
