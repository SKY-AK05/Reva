"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import RevaLogo from '@/components/reva-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  LayoutDashboard,
  CheckSquare,
  DollarSign,
  Bell,
  Target,
  ChevronsRight,
  ChevronsLeft,
  Aperture,
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
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="group-data-[collapsible=icon]:hidden pl-2">
          <RevaLogo size="md" />
        </div>
        <div className="hidden group-data-[collapsible=icon]:block mx-auto">
            <Aperture className="h-6 w-6" />
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
      <SidebarFooter className='items-center gap-2'>
         <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden w-full">
            <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold">User</span>
         </div>
          <SidebarMenuButton onClick={toggleSidebar} tooltip={{children: state === 'expanded' ? 'Collapse' : 'Expand', side: 'right'}}>
            {state === 'expanded' ? <ChevronsLeft /> : <ChevronsRight />}
            <span className="sr-only">{state === 'expanded' ? 'Collapse' : 'Expand'}</span>
         </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
