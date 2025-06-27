'use client';

import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type ScrollAnimatorProps = {
  children: ReactNode;
  className?: string;
};

export default function ScrollAnimator({ children, className }: ScrollAnimatorProps) {
  const { ref, inView } = useInView({
    triggerOnce: true, // Animate only once
    threshold: 0.1, // Trigger when 10% of the element is visible
  });

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0', // Start as invisible
        inView && 'animate-fade-in-up', // Apply animation when in view
        className
      )}
    >
      {children}
    </div>
  );
}
