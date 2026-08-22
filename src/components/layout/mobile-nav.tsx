'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FolderKanban, Calendar, Search, Settings, Lightbulb } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Today', href: '/today', icon: Lightbulb },
  { name: 'Timeline', href: '/timeline', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 dark:border-white/5 glass-nav md:hidden backdrop-blur-xl">
      <div className="flex h-16 items-center justify-around">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-[10px] font-medium transition-all',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                isActive && 'bg-indigo-500/10'
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
