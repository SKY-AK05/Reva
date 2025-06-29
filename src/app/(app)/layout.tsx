import AppHeader from '@/components/app-header';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-5xl mx-auto mt-6 bg-card rounded-t-2xl shadow-2xl overflow-y-auto border-t-2 border-x-2 border-white">
        {children}
      </main>
    </div>
  );
}
