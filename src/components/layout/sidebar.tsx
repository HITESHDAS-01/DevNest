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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Timeline', href: '/timeline', icon: Calendar },
  { name: 'Search', href: '/search', icon: Search },
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 px-4">
        <span className="text-2xl">🪹</span>
        <span className="font-semibold text-lg">DevNest</span>
      </div>

      <div className="px-3 py-2">
        <Link href="/projects/new">
          <Button className="w-full justify-start gap-2" size="sm">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="px-3 py-4">
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Zap className="h-4 w-4 text-yellow-500" />
            Quick Actions
          </div>
          <div className="mt-2 space-y-1">
            <Link
              href="/today"
              className="block text-xs text-muted-foreground hover:text-foreground"
            >
              What to work on next?
            </Link>
          </div>
        </div>
      </div>

      <nav className="space-y-1 px-3 py-4">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
