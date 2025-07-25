
'use client';
import Image from 'next/image';
import PublicHeader from '@/components/public-header';
import RevaLogo from '@/components/reva-logo';
import ScrollAnimator from '@/components/scroll-animator';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Check,
  MessageSquare,
  CheckSquare,
  DollarSign,
  StickyNote,
  Target,
  BookText,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ScrollAnimatorRight from '@/components/scroll-animator-right';
import HeroAnimator from '@/components/hero-animator';

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
        // No longer redirecting from home page
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
        <HeroAnimator>
          <section className="py-20 md:py-32">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight hero-headline">
                        Your Personal AI Assistant <br /> to Streamline Your Life
                    </h1>
                    <p className="mt-6 max-w-xl mx-auto md:mx-0 text-lg text-muted-foreground hero-subheadline">
                        Reva helps you manage tasks, track expenses, and stay organized
                        with intelligent chat-based assistance. Focus on what matters, let
                        Reva handle the rest.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 hero-button">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto"
                            onClick={handleGetStarted}
                        >
                            Get Started for Free
                        </Button>
                    </div>
                </div>
                <div className="relative mx-auto w-full max-w-2xl h-auto shadow-2xl rounded-2xl hero-image">
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
        </HeroAnimator>

        {/* Features Section */}
        <ScrollAnimatorRight>
           <section id="features" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
               <div className="text-center mb-12 md:mb-16">
                <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
                  All Your Tools in One Place
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                  Stop juggling apps. Reva brings everything together with a single, smart, conversational interface, beautifully organized.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                <Card className="p-6 flex flex-col lg:col-span-2">
                  <CardHeader className="p-0">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-7 h-7 text-primary" />
                      <CardTitle className="text-2xl">AI-Powered Chat</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 flex-1">
                    <p className="text-muted-foreground">Just talk to Reva. Create tasks, log expenses, or set reminders using natural language.</p>
                  </CardContent>
                </Card>

                <Card className="p-6 flex flex-col">
                  <CardHeader className="p-0">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-7 h-7 text-primary" />
                      <CardTitle className="text-2xl">Tasks</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 flex-1">
                     <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border-2 border-primary bg-primary flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-primary-foreground" /></div><span className="flex-1 line-through text-muted-foreground">Book flight to NYC</span></li>
                        <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border-2 border-primary shrink-0"></div><span className="flex-1">Finish design proposal</span></li>
                        <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border-2 border-primary shrink-0"></div><span className="flex-1">Send weekly report</span></li>
                      </ul>
                  </CardContent>
                </Card>
                
                <Card className="p-6 flex flex-col">
                   <CardHeader className="p-0">
                    <div className="flex items-center gap-3">
                      <Bell className="w-7 h-7 text-primary" />
                      <CardTitle className="text-2xl">Reminders</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 flex-1">
                    <p className="text-muted-foreground">Set smart reminders that ensure you never miss an important deadline or event again.</p>
                  </CardContent>
                </Card>

                <Card className="p-6 flex flex-col lg:row-span-2">
                  <CardHeader className="p-0">
                    <div className="flex items-center gap-3">
                      <Target className="w-7 h-7 text-primary" />
                      <CardTitle className="text-2xl">Goals & Notes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 flex-1">
                    <p className="text-muted-foreground">Track your ambitions and capture brilliant ideas.</p>
                    <div className="mt-4">
                      <p className="font-semibold text-sm">Launch new website</p>
                      <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
                        <div className="bg-primary h-2.5 rounded-full" style={{width: "75%"}}></div>
                      </div>
                      <p className="text-right text-sm text-muted-foreground mt-1">75%</p>
                    </div>
                    <div className="mt-4 text-sm bg-secondary/50 p-3 rounded-lg">
                      <p className="font-semibold">Meeting Summary</p>
                      <p className="text-muted-foreground">Q3 planning session was a success. Key takeaways are...</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="relative rounded-2xl shadow-lg h-full min-h-[280px] lg:col-span-2 lg:row-span-2 overflow-visible">
                    <Image
                        src="/assets/women.png"
                        alt="A woman happily using the Reva productivity app on her phone"
                        fill
                        className="object-contain scale-[1.7] -translate-y-32"
                        data-ai-hint="woman using phone"
                        quality={100}
                    />
                </Card>

                <Card className="p-6 flex flex-col">
                  <CardHeader className="p-0">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-7 h-7 text-primary" />
                      <CardTitle className="text-2xl">Expenses</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 flex-1">
                    <ul className="space-y-3 text-sm">
                      <li className="flex justify-between items-center"><span>Morning Coffee</span><span className="font-semibold">₹150</span></li>
                      <li className="flex justify-between items-center"><span>Team Lunch</span><span className="font-semibold">₹1200</span></li>
                      <li className="flex justify-between items-center"><span>Train Ticket</span><span className="font-semibold">₹50</span></li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="p-6 flex flex-col">
                  <CardHeader className="p-0">
                    <div className="flex items-center gap-3">
                      <BookText className="w-7 h-7 text-primary" />
                      <CardTitle className="text-2xl">Journal</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 flex-1">
                    <p className="text-muted-foreground">Record your thoughts and feelings in a private space.</p>
                  </CardContent>
                </Card>

              </div>
            </div>
          </section>
        </ScrollAnimatorRight>

        {/* Pricing Section */}
        <ScrollAnimator>
          <section id="pricing" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
              <div className="bg-secondary/50 rounded-2xl p-8 md:p-12 lg:p-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">
                      Get Started with Reva
                      <br />
                      Today
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-md">
                      Simple, transparent pricing. Get started for free, no credit card
                      required. Unlock a more organized life in minutes.
                    </p>
                  </div>
                  
                  <div className="w-full">
                    <Card className="bg-foreground text-background p-6 md:p-8 rounded-2xl shadow-2xl">
                      <CardHeader className="p-0 pb-6">
                        <CardTitle className="text-2xl font-bold">Free Plan</CardTitle>
                        <CardDescription className="text-background/80 pt-1">For individuals getting started.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 pt-6">
                        <div className="mb-6">
                          <span className="text-5xl font-bold">₹0</span>
                          <span className="text-xl text-background/80">/mo</span>
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
                        <Button size="lg" asChild className="w-full rounded-full py-6 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                          <Link href="/signup">Sign Up</Link>
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
