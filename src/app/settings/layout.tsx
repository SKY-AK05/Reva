import PublicHeader from '@/components/public-header';
import React from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto">
            <div className="w-full max-w-5xl mx-auto">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
}
