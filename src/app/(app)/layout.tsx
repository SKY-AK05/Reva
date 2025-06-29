import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background text-foreground min-h-screen flex w-full">
      <div className="hidden md:flex md:w-72 border-r border-border/80 flex-col">
        <AppSidebar />
      </div>
      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto mt-6 bg-card rounded-t-2xl shadow-2xl border-t-2 border-x-2 border-white">
          {children}
        </main>
      </div>
    </div>
  );
}
