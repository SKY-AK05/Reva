import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RevaLogo from '@/components/reva-logo';
import { User } from 'lucide-react';

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <RevaLogo size="sm" />
          <span className="font-semibold">Reva</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button className="bg-black text-white hover:bg-gray-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90" asChild>
            <Link href="/signup">
              <User className="mr-2 h-4 w-4" />
              Sign up
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
