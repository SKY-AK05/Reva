"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  History,
  Menu,
  MessageSquare,
  ArrowLeftToLine,
  ArrowRightToLine,
} from 'lucide-react';
import RevaLogo from './reva-logo';


export default function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();

  const menuItems = [
    { href: '/overview', label: 'Search', icon: Search },
    { href: '/tasks', label: 'History', icon: History },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <Sidebar collapsible="icon">
      <div className="flex h-full flex-col items-center justify-between p-2">
        <SidebarMenu className="gap-2">
            <SidebarMenuItem>
                <Link href="/overview" passHref legacyBehavior>
                    <SidebarMenuButton
                        tooltip={{ children: "Reva", side: 'right' }}
                        className="h-12 w-12"
                        isActive={pathname === '/overview'}
                    >
                        <RevaLogo size="sm" />
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label, side: 'right' }}
                  >
                    <item.icon className="h-5 w-5" />
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem className="mt-auto">
                <Link href="#" passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip={{ children: "Menu", side: 'right' }}
                    disabled
                  >
                    <Menu className="h-5 w-5" />
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
          </SidebarMenu>

        <SidebarMenu className="gap-2">
             <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{ children: "User", side: 'right' }}
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar"/>
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={toggleSidebar}
                  tooltip={{ children: state === 'collapsed' ? "Expand" : "Collapse", side: 'right' }}
                >
                    {state === 'collapsed' ? <ArrowRightToLine className="h-5 w-5" /> : <ArrowLeftToLine className="h-5 w-5" />}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}
