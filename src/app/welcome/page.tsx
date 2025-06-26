import Link from 'next/link';
import RevaLogo from '@/components/reva-logo';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';

export default function WelcomePage() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-8 text-center">
        <RevaLogo size="lg" />
        <p className="text-xl text-muted-foreground">
          Where Plans Find Purpose
        </p>
        <div className="flex w-full max-w-xs flex-col space-y-4 pt-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/chat">
              <Chrome className="mr-2 h-5 w-5" />
              Continue with Google
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase text-muted-foreground">Or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button asChild size="lg" variant="secondary" className="w-full">
            <Link href="/chat">Sign Up</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="w-full">
            <Link href="/chat">Log In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
