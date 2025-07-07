
'use client';
import Image from 'next/image';
import PublicHeader from '@/components/public-header';
import RevaLogo from '@/components/reva-logo';
import ScrollAnimator from '@/components/scroll-animator';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  Check,
  MessageSquare,
  CheckSquare,
  DollarSign,
  StickyNote,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setLoggedIn(!!session);
      if (event === 'SIGNED_IN' && window.location.pathname === '/') {
        router.push('/chat');
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleGetStarted = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (loggedIn) {
      router.push('/chat');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background bg-noise">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <ScrollAnimator>
          <section className="py-20 md:py-32">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
                        Your Personal AI Assistant <br /> to Streamline Your Life
                    </h1>
                    <p className="mt-6 max-w-xl mx-auto md:mx-0 text-lg text-muted-foreground">
                        Reva helps you manage tasks, track expenses, and stay organized
                        with intelligent chat-based assistance. Focus on what matters, let
                        Reva handle the rest.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                            onClick={handleGetStarted}
                        >
                            Get Started for Free
                        </Button>
                    </div>
                </div>
                <div className="relative mx-auto w-full max-w-2xl h-auto shadow-2xl rounded-2xl">
                    <Image
                        src="/assets/chat_Dark.png"
                        alt="Reva App Screenshot (Light Theme)"
                        width={1200}
                        height={750}
                        className="w-full h-auto block dark:hidden rounded-2xl"
                        data-ai-hint="app screenshot light"
                        priority
                    />
                    <Image
                        src="/assets/Chat_Light.png"
                        alt="Reva App Screenshot (Dark Theme)"
                        width={1200}
                        height={750}
                        className="w-full h-auto hidden dark:block rounded-2xl"
                        data-ai-hint="app screenshot dark"
                        priority
                    />
                </div>
              </div>
            </div>
          </section>
        </ScrollAnimator>

        {/* Features Section */}
        <ScrollAnimator>
           <section id="features" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
                <div className="relative mx-auto w-full max-w-md">
                   <Image
                      src="/assets/women.png"
                      alt="A woman happily using the Reva productivity app on her phone"
                      width={500}
                      height={500}
                      className="w-full h-auto"
                      data-ai-hint="woman using phone"
                    />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
                    All Your Tools in One Place
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Stop juggling apps. Reva brings everything together with a single, smart, conversational interface.
                  </p>
                  <ul className="mt-8 space-y-6 text-left">
                    <li className="flex items-start gap-4">
                      <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">AI-Powered Chat</h3>
                        <p className="text-muted-foreground mt-1">Just talk to Reva. Create tasks, log expenses, or set reminders using natural language.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                       <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center">
                          <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Task Management</h3>
                        <p className="text-muted-foreground mt-1">Keep track of your to-dos with priorities and due dates, all in one place.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                       <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center">
                          <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Intelligent Expense Tracking</h3>
                        <p className="text-muted-foreground mt-1">Log your spending on the fly and let our AI automatically categorize it for you.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </ScrollAnimator>

        {/* Pricing Section */}
        <ScrollAnimator>
          <section id="pricing" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
              <div className="bg-black text-white rounded-2xl p-8 md:p-12 lg:p-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">
                      Get Started with Reva
                      <br />
                      Today
                    </h2>
                    <p className="text-lg text-gray-300 max-w-md">
                      Simple, transparent pricing. Get started for free, no credit card
                      required. Unlock a more organized life in minutes.
                    </p>
                  </div>
                  
                  <div className="w-full">
                    <Card className="bg-white text-black p-6 md:p-8 rounded-2xl shadow-2xl">
                      <CardHeader className="p-0 pb-6">
                        <CardTitle className="text-2xl font-bold">Free Plan</CardTitle>
                        <CardDescription className="text-gray-600 pt-1">For individuals getting started.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 pt-6">
                        <div className="mb-6">
                          <span className="text-5xl font-bold">$0</span>
                          <span className="text-xl text-gray-500">/mo</span>
                        </div>
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>Unlimited Tasks</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>Unlimited Expenses</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>Unlimited Reminders</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>AI-Powered Chat</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter className="p-0 pt-8">
                        <Button size="lg" asChild className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-6 text-base font-semibold">
                          <Link href="/signup">Get Started</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollAnimator>
      </main>
      <footer className="border-t">
        <div className="container mx-auto py-8 px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <RevaLogo size="sm" />
            <span className="font-semibold">Reva</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Reva. All rights reserved.
          </p>
          <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

    