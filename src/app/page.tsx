"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RevaLogo from '@/components/reva-logo';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/app/overview');
    }, 2000); // 2 second splash screen

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-black">
      <div className="animate-pulse">
        <RevaLogo size="lg" />
      </div>
    </main>
  );
}
