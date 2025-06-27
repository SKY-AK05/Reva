import RevaLogo from '@/components/reva-logo';
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl shadow-2xl lg:grid-cols-2">
          <div className="relative hidden h-full flex-col bg-black p-10 text-white lg:flex">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover brightness-50"
            >
              <source src="/assets/Animation_Video_Ready_Productivity.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
              <RevaLogo size="sm" />
              <span className="font-semibold">Reva</span>
            </div>
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-4">
                <p className="font-headline text-4xl leading-tight">
                  Get Everything You Want
                </p>
                <p className="text-base text-zinc-300">
                  You can get everything you want if you work hard, trust the process, and stick to the plan.
                </p>
                <footer className="text-sm pt-2 uppercase tracking-wider">A Wise Quote</footer>
              </blockquote>
            </div>
          </div>
          <div className="flex items-center justify-center bg-card p-6 sm:p-12">
            {children}
          </div>
      </div>
    </div>
  );
}
