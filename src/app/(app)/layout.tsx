import AppSidebar from '@/components/app-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
          <SidebarTrigger />
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="smiling man" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </header>
        <div className="flex flex-1 flex-col min-h-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
