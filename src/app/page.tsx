import ChatInterface from '@/components/chat-interface';
import PublicHeader from '@/components/public-header';
import RevaLogo from '@/components/reva-logo';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  CheckSquare,
  DollarSign,
  Bell,
  Target,
  BookText,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: CheckSquare,
    title: 'Task Management',
    description:
      'Create, organize, and prioritize your to-dos with simple commands.',
  },
  {
    icon: DollarSign,
    title: 'Expense Tracking',
    description:
      'Log your spending on the go and never lose track of your budget.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Set reminders for anything and get notified at the right time.',
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Define your goals and track your progress towards achieving them.',
  },
  {
    icon: BookText,
    title: 'Personal Journal',
    description: 'Capture your thoughts and ideas in a private, secure journal.',
  },
  {
    icon: BrainCircuit,
    title: 'AI-Powered',
    description:
      'Leverage the power of AI to understand and act on your requests.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
              Your Personal AI Assistant <br /> to Streamline Your Life
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              Reva helps you manage tasks, track expenses, and stay organized
              with intelligent chat-based assistance. Focus on what matters, let
              Reva handle the rest.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
              >
                <Link href="/signup">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Chat Interface Section */}
        <section className="relative pb-20 md:pb-32">
          <div className="container mx-auto px-4">
            <div className="relative h-[600px] border rounded-2xl shadow-lg overflow-hidden">
              <ChatInterface isPublic={true} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                Everything you need, all in one place.
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                Reva is designed to be your all-in-one life assistant, helping
                you stay on top of your day.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">
              Ready to take control?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Sign up now and start organizing your life in a smarter way.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                asChild
                className="bg-black text-white hover:bg-gray-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
              >
                <Link href="/signup">Sign Up for Free</Link>
              </Button>
            </div>
          </div>
        </section>
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
