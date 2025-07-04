'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import { cn } from '@/lib/utils';
import { NotesContextProvider } from '@/context/notes-context';
import { TasksContextProvider } from '@/context/tasks-context';
import { ExpensesContextProvider } from '@/context/expenses-context';
import { GoalsContextProvider } from '@/context/goals-context';
import { RemindersContextProvider } from '@/context/reminders-context';
import { JournalContextProvider } from '@/context/journal-context';
import { ChatContextProvider } from '@/context/chat-context';
import { ToneContextProvider } from '@/context/tone-context';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Pinned state
  const [isSidebarHovered, setIsSidebarHovered] = useState(false); // Hover state
  const [showGridLines, setShowGridLines] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleGridLines = () => {
    setShowGridLines((prev) => !prev);
  }

  const showExpandedView = isSidebarOpen || isSidebarHovered;

  return (
    <ToneContextProvider>
      <ChatContextProvider>
        <NotesContextProvider>
          <TasksContextProvider>
            <ExpensesContextProvider>
              <GoalsContextProvider>
                <RemindersContextProvider>
                  <JournalContextProvider>
                    <div className="bg-background bg-noise text-foreground flex w-full h-screen overflow-hidden">
                      <div
                        className={cn(
                          'hidden md:flex flex-col border-r border-border/80 transition-all duration-300',
                          showExpandedView ? 'w-72' : 'w-20'
                        )}
                        onMouseEnter={() => setIsSidebarHovered(true)}
                        onMouseLeave={() => setIsSidebarHovered(false)}
                      >
                        <AppSidebar
                          isCollapsed={!showExpandedView}
                          isPinned={isSidebarOpen}
                          onToggleSidebar={toggleSidebar}
                        />
                      </div>
                      <div className="flex flex-1 flex-col min-w-0">
                        <AppHeader 
                          showGridLines={showGridLines}
                          onToggleGridLines={toggleGridLines}
                        />
                        <div className="flex-1 overflow-y-auto">
                          <div className="p-6">
                            <main className={cn(
                              "flex flex-col w-full max-w-5xl mx-auto bg-card rounded-t-2xl shadow-2xl border-t border-x border-border min-h-[calc(100vh-4rem-3rem)]",
                              !showGridLines && 'no-grid-lines'
                              )}>
                              {children}
                            </main>
                          </div>
                        </div>
                      </div>
                    </div>
                  </JournalContextProvider>
                </RemindersContextProvider>
              </GoalsContextProvider>
            </ExpensesContextProvider>
          </TasksContextProvider>
        </NotesContextProvider>
      </ChatContextProvider>
    </ToneContextProvider>
  );
}
