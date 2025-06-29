'use client';
    
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Library, Plus } from 'lucide-react';
import AppSidebar from '@/components/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RevaLogo from './reva-logo';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            <span>Library</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <AppSidebar />
        </SheetContent>
      </Sheet>
      <Button variant="default" size="sm" asChild>
        <Link href="/journal" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </Link>
      </Button>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="smiling man" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
