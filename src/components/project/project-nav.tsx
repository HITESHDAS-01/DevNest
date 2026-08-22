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
    <nav className="flex space-x-1 overflow-x-auto border-b">
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
              'whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
