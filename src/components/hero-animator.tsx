
'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeroAnimator({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from('.hero-headline', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
      .from('.hero-subheadline', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.6')
      .from('.hero-button', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.6')
      .from('.hero-image', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      }, '-=0.8');
    }, root);

    return () => ctx.revert();
  }, []);

  return <div ref={root}>{children}</div>;
}
