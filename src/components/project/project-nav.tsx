'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Milestones', href: '/milestones' },
  { name: 'Blockers', href: '/blockers' },
  { name: 'Notes', href: '/notes' },
  { name: 'Decisions', href: '/decisions' },
  { name: 'Ideas', href: '/ideas' },
  { name: 'Resources', href: '/resources' },
  { name: 'Maintenance', href: '/maintenance' },
  { name: 'Memory', href: '/memory' },
  { name: 'Settings', href: '/settings' },
];

interface ProjectNavProps {
  projectSlug: string;
}

export function ProjectNav({ projectSlug }: ProjectNavProps) {
  const pathname = usePathname();
  const basePath = `/projects/${projectSlug}`;

  return (
    <nav className="flex space-x-1 overflow-x-auto rounded-xl border border-white/20 dark:border-white/10 p-1">
      {navigation.map((item) => {
        const href = `${basePath}${item.href}`;
        const isActive =
          pathname === href ||
          (item.href === '' && pathname === basePath);
        return (
          <Link
            key={item.name}
            href={href}
            className={cn(
              'whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all',
              isActive
                ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground'
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
