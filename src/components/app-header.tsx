'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft, Plus } from 'lucide-react';
import AppSidebar from '@/components/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AppHeader() {
  const handleNewChat = () => {
    // A full page navigation/reload will reset the chat component's state.
    window.location.href = '/chat';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      {/* Mobile Toggle */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 p-0 border-r-border/80 bg-background/95 backdrop-blur-sm"
        >
          <AppSidebar />
        </SheetContent>
      </Sheet>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNewChat}
        className="border-border/80 hover:bg-accent flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        <span>New Chat</span>
      </Button>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <Avatar className="h-9 w-9">
          <AvatarImage
            src="https://placehold.co/40x40.png"
            alt="User"
            data-ai-hint="smiling man"
          />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
