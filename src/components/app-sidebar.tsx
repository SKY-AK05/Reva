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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  DollarSign,
  Bell,
  Target,
  BookText,
  ArrowLeftToLine,
  ArrowRightToLine,
} from 'lucide-react';
import RevaLogo from './reva-logo';

export default function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();

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

      <SidebarFooter className="p-2">
        <SidebarMenu className="flex flex-col gap-1">
          <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: "User", side: 'right' }} className="justify-start">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar"/>
                      <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="group-data-[state=collapsed]:hidden">User Name</span>
              </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <SidebarMenuButton
                  onClick={toggleSidebar}
                  tooltip={{ children: state === 'collapsed' ? "Expand" : "Collapse", side: 'right' }}
                  className="justify-start"
              >
                  {state === 'collapsed' ? <ArrowRightToLine className="h-5 w-5" /> : <ArrowLeftToLine className="h-5 w-5" />}
                  <span className="group-data-[state=collapsed]:hidden">{state === 'collapsed' ? "Expand" : "Collapse"}</span>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
