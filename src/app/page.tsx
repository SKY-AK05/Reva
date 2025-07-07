
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const testimonials = [
  {
    quote: "Reva has completely changed how I manage my daily tasks. It's so intuitive, I just talk to it like a person!",
    name: 'Alex Johnson',
    title: 'Freelance Designer',
    avatar: 'https://placehold.co/40x40.png',
    avatarHint: 'smiling person'
  },
  {
    quote: "I've tried every budget app out there. Reva is the first one that has stuck because it's just so easy to log expenses on the fly.",
    name: 'Samantha Lee',
    title: 'Product Manager',
    avatar: 'https://placehold.co/40x40.png',
    avatarHint: 'happy woman'
  }
];

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

        {/* Bento Grid Features Section */}
        <ScrollAnimator>
          <section id="features" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
                  A Smarter Way to Organize Your Life
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Reva integrates all your productivity tools into one intelligent,
                  conversational interface. Here's how it all comes together.
                </p>
              </div>
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 auto-rows-[22rem]">
                {/* Chat Card */}
                <Card className="md:col-span-2 md:row-span-2 p-6 flex flex-col justify-between overflow-hidden bg-secondary/50">
                  <div>
                    <MessageSquare className="w-8 h-8 mb-4 text-primary" />
                    <CardTitle className="text-2xl font-bold font-headline">
                      Converse, Don't Command
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      Interact with Reva using natural language. Create tasks, log
                      expenses, or set reminders just by talking. It's that simple.
                    </CardDescription>
                  </div>
                  <div className="mt-4 -mb-12 -mr-8">
                    <Image
                      src="https://placehold.co/800x500.png"
                      alt="Chat interface screenshot"
                      width={800}
                      height={500}
                      className="w-full h-auto rounded-tl-lg shadow-2xl"
                      data-ai-hint="app chat interface"
                    />
                  </div>
                </Card>

                {/* Tasks Card */}
                <Card className="p-6 flex flex-col justify-between bg-secondary/50">
                  <div>
                    <CheckSquare className="w-8 h-8 mb-4 text-primary" />
                    <CardTitle className="text-xl font-bold font-headline">
                      Task Management
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Keep track of your to-dos with priorities and due dates.
                    </CardDescription>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-background">
                        <div className="w-5 h-5 rounded-sm border border-primary"></div>
                        <p className="flex-1 line-through text-muted-foreground">Finish project proposal</p>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-background ring-2 ring-primary">
                        <div className="w-5 h-5 rounded-sm border border-primary bg-primary"></div>
                        <p className="flex-1 font-medium">Follow up with design team</p>
                    </div>
                     <div className="flex items-center gap-2 p-3 rounded-lg bg-background">
                        <div className="w-5 h-5 rounded-sm border border-primary"></div>
                        <p className="flex-1">Book flight for conference</p>
                    </div>
                  </div>
                </Card>

                {/* Notes Card */}
                <Card className="p-6 flex flex-col bg-secondary/50">
                  <StickyNote className="w-8 h-8 mb-4 text-primary" />
                  <CardTitle className="text-xl font-bold font-headline">
                    Rich Note-Taking
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Capture your ideas in a powerful editor that supports rich text,
                    images, and even AI-generated charts.
                  </CardDescription>
                </Card>

                {/* Expenses Card */}
                <Card className="p-6 flex flex-col justify-between bg-secondary/50">
                   <div>
                    <DollarSign className="w-8 h-8 mb-4 text-primary" />
                    <CardTitle className="text-xl font-bold font-headline">
                      Expense Tracking
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Log spending on the fly and let Reva categorize it for you.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-end mt-4 h-24">
                      <div className="flex-1 bg-primary/50 rounded-t-md h-[40%]"></div>
                      <div className="flex-1 bg-primary/50 rounded-t-md h-[70%]"></div>
                      <div className="flex-1 bg-primary rounded-t-md h-full"></div>
                      <div className="flex-1 bg-primary/50 rounded-t-md h-[60%]"></div>
                      <div className="flex-1 bg-primary/50 rounded-t-md h-[30%]"></div>
                  </div>
                </Card>

                {/* AI Card */}
                <Card className="p-6 bg-secondary/50">
                  <BrainCircuit className="w-8 h-8 mb-4 text-primary" />
                  <CardTitle className="text-xl font-bold font-headline">AI at the Core</CardTitle>
                  <CardDescription className="mt-2">
                    Powered by Google's latest models to understand your requests,
                    find what you need, and help you get things done faster.
                  </CardDescription>
                </Card>

                {/* Goals Card */}
                <Card className="p-6 bg-secondary/50">
                  <Target className="w-8 h-8 mb-4 text-primary" />
                  <CardTitle className="text-xl font-bold font-headline">Goals & Journal</CardTitle>
                  <CardDescription className="mt-2">
                    Track your long-term ambitions and reflect on your progress
                    with an integrated journal.
                  </CardDescription>
                </Card>
              </div>
            </div>
          </section>
        </ScrollAnimator>

        {/* Testimonials Section */}
        <ScrollAnimator>
          <section className="py-20 md:py-32 bg-secondary">
             <div className="container mx-auto px-4">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">
                  Loved by People Like You
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                  See what our users are saying about their newfound productivity.
                </p>
              </div>
              <div className="mt-12 grid gap-8 md:grid-cols-2">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.name} className="p-6">
                    <CardContent className="p-0">
                      <blockquote className="text-lg font-semibold leading-snug">
                        “{testimonial.quote}”
                      </blockquote>
                    </CardContent>
                    <CardFooter className="p-0 mt-4 flex items-center gap-4">
                       <Avatar>
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.avatarHint} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
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
