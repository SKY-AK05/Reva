import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RevaLogo from '@/components/reva-logo';

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <RevaLogo size="sm" />
            <span className="font-semibold">Reva</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            asChild
          >
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
