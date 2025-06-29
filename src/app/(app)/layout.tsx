import AppHeader from '@/components/app-header';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <div className="h-full w-full bg-card rounded-t-2xl shadow-2xl overflow-hidden">
            {children}
        </div>
      </main>
    </div>
  );
}
