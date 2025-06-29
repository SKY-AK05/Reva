'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  DollarSign,
  Bell,
  Target,
  BookText,
} from 'lucide-react';
import RevaLogo from './reva-logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function AppSidebar({ isCollapsed }: { isCollapsed?: boolean }) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/expenses', label: 'Expenses', icon: DollarSign },
    { href: '/reminders', label: 'Reminders', icon: Bell },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/journal', label: 'Journal', icon: BookText },
  ];

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'p-4 flex items-center h-16',
          isCollapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <Link href="/chat" className="flex items-center gap-3">
          <RevaLogo size="sm" />
          <span className={cn('font-semibold text-lg', isCollapsed && 'hidden')}>
            Reva
          </span>
        </Link>
      </div>
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 flex flex-col gap-1 p-2">
          {menuItems.map((item) =>
            isCollapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'justify-center',
                      pathname.startsWith(item.href) && 'bg-accent'
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  'justify-start',
                  pathname.startsWith(item.href) && 'bg-accent'
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            )
          )}
        </nav>
      </TooltipProvider>
    </div>
  );
}
