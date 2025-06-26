"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
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

export default function AppSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/expenses', label: 'Expenses', icon: DollarSign },
    { href: '/reminders', label: 'Reminders', icon: Bell },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/journal', label: 'Journal', icon: BookText },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="p-0">
        <SidebarHeader className="p-2">
            <Link href="/overview" className="flex items-center gap-3 p-2">
                <RevaLogo size="sm" />
                <span className="font-semibold text-lg group-data-[state=collapsed]:hidden">Reva</span>
            </Link>
        </SidebarHeader>

        <SidebarMenu className="flex-1 flex flex-col gap-1 p-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right' }}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
