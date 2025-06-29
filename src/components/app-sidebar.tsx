"use client";

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

export default function AppSidebar() {
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
      <div className="p-4">
        <Link href="/chat" className="flex items-center gap-3">
            <RevaLogo size="sm" />
            <span className="font-semibold text-lg">Reva</span>
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-1 p-2">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn("justify-start", pathname.startsWith(item.href) && "bg-accent")}
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
}
