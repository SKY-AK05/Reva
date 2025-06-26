"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import RevaLogo from '@/components/reva-logo';
import {
  MessageSquare,
  LayoutDashboard,
  CheckSquare,
  DollarSign,
  Bell,
  Target,
} from 'lucide-react';

const menuItems = [
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/expenses', label: 'Expenses', icon: DollarSign },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/goals', label: 'Goals', icon: Target },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="group-data-[collapsible=icon]:hidden pl-2">
          <RevaLogo size="md" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
