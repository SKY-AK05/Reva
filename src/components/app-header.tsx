'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  PanelLeft,
  User,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Grid,
  StickyNote,
  ChevronDown,
  MessageSquare,
  Plus,
  Settings,
} from 'lucide-react';
import AppSidebar from '@/components/app-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useNotesContext } from '@/context/notes-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useChatContext } from '@/context/chat-context';

interface AppHeaderProps {
  showGridLines: boolean;
  onToggleGridLines: () => void;
}

export default function AppHeader({
  showGridLines,
  onToggleGridLines,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { notes, activeNote, setActiveNoteById, addNewNote } =
    useNotesContext();
  const { clearChat } = useChatContext();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  const handleSelectNote = (noteId: string) => {
    setActiveNoteById(noteId);
    router.push('/notes');
  };

  const handleAddNewNote = () => {
    addNewNote();
    if (pathname !== '/notes') {
      router.push('/notes');
    }
  };

  const handleNewChat = async () => {
    await clearChat();
    if (pathname !== '/chat') {
      router.push('/chat');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        router.refresh();
      }
    });
    
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const userInitial = user?.user_metadata?.name ? user.user_metadata.name[0].toUpperCase() : (user?.email?.[0]?.toUpperCase() ?? 'U');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-background/95 px-4 backdrop-blur-sm sm:px-6">
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

      {pathname.startsWith('/notes') ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddNewNote}
          className="border-border/80 hover:bg-accent flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNewChat}
          className="border-border/80 hover:bg-accent flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      )}

      {pathname.startsWith('/notes') && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-border/80 hover:bg-accent flex items-center gap-2"
            >
              <StickyNote className="h-4 w-4" />
              <span className="truncate max-w-28">
                {activeNote ? activeNote.title : 'Notes'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Recent Notes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notes.length > 0 ? (
              notes.map((note) => (
                <DropdownMenuItem
                  key={note.id}
                  onSelect={() => handleSelectNote(note.id)}
                >
                  <span className="truncate">{note.title}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No recent notes</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url || undefined}
                  alt={user?.user_metadata?.name || user?.email || 'User'}
                />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {user.user_metadata?.name ? (
                  <>
                    <p className="text-sm font-medium leading-none">{user.user_metadata.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </>
                ) : (
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-1">
              <div className="flex items-center justify-around rounded-md bg-muted p-1 text-sm text-muted-foreground">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'inline-flex items-center justify-center gap-1 rounded-sm px-3 py-1.5 transition-colors w-full',
                    theme === 'light' &&
                      'bg-background text-foreground shadow-sm'
                  )}
                >
                  <Sun className="h-4 w-4" /> Light
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    'inline-flex items-center justify-center gap-1 rounded-sm px-3 py-1.5 transition-colors w-full',
                    theme === 'system' &&
                      'bg-background text-foreground shadow-sm'
                  )}
                >
                  <Laptop className="h-4 w-4" /> Auto
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'inline-flex items-center justify-center gap-1 rounded-sm px-3 py-1.5 transition-colors w-full',
                    theme === 'dark' && 'bg-background text-foreground shadow-sm'
                  )}
                >
                  <Moon className="h-4 w-4" /> Dark
                </button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center justify-between"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                <span>Show Grid Lines</span>
              </div>
              <Switch
                id="grid-lines"
                checked={showGridLines}
                onCheckedChange={onToggleGridLines}
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )}
      </div>
    </header>
  );
}
