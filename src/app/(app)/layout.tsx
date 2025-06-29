'use client';

import { useState } from 'react';
import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import { cn } from '@/lib/utils';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex w-full">
      <div
        className={cn(
          'hidden md:flex flex-col border-r border-border/80 transition-all duration-300',
          isSidebarOpen ? 'w-72' : 'w-20'
        )}
      >
        <AppSidebar isCollapsed={!isSidebarOpen} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader onToggleSidebar={toggleSidebar} />
        <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto mt-6 bg-card rounded-t-2xl shadow-2xl border-t-2 border-x-2 border-white">
          {children}
        </main>
      </div>
    </div>
  );
}
