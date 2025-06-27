import PublicHeader from '@/components/public-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Check } from 'lucide-react';
import RevaLogo from '@/components/reva-logo';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                    A smarter way to manage life
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Reva is your intelligent assistant to help you organize tasks, track expenses, and never forget a thing. Take control of your day.
                  </p>
                  <ul className="grid gap-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>AI-powered chat for quick actions.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Beautiful dashboards for tasks, goals, & more.</span>
                    </li>
                     <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Light and Dark mode available.</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                   <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90">
                    <Link href="/signup">
                      Get Started Free
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x600.png"
                width="600"
                height="600"
                alt="Reva App Screenshot"
                data-ai-hint="app dashboard"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">Features</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything you need. Nothing you don't.</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                           From tasks and reminders to goals and journaling, Reva brings all aspects of your personal productivity into one streamlined and beautiful interface.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                     <Image
                        src="https://placehold.co/600x400.png"
                        width="600"
                        height="400"
                        alt="Chat Interface"
                        data-ai-hint="chat interface"
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
                    />
                    <div className="flex flex-col justify-center space-y-4">
                        <ul className="grid gap-6">
                            <li>
                                <div className="grid gap-1">
                                    <h3 className="text-xl font-bold">Intuitive Chat</h3>
                                    <p className="text-muted-foreground">Just tell Reva what to do. "Add a task to buy milk," or "Remind me to call John tomorrow at 10 am." It's that easy.</p>
                                </div>
                            </li>
                            <li>
                                <div className="grid gap-1">
                                    <h3 className="text-xl font-bold">Holistic Overview</h3>
                                    <p className="text-muted-foreground">See your upcoming tasks, recent expenses, and progress on your goals all in one place.</p>
                                </div>
                            </li>
                             <li>
                                <div className="grid gap-1">
                                    <h3 className="text-xl font-bold">Private Journal</h3>
                                    <p className="text-muted-foreground">A secure and private space for your thoughts, ideas, and reflections.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
            <div className="flex items-center gap-2">
                <RevaLogo size="sm" />
                <p className="text-xs text-muted-foreground">&copy; 2024 Reva. All rights reserved.</p>
            </div>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
                Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
                Privacy
            </Link>
            </nav>
      </footer>

      </main>
    </div>
  );
}