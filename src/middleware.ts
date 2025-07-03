import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const protectedRoutes = ['/chat', '/overview', '/tasks', '/expenses', '/reminders', '/goals', '/journal', '/notes', '/settings'];
  const authRoutes = ['/login', '/signup'];

  // If user is not logged in and tries to access a protected route
  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and tries to access an auth route
  if (user && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }
  
  // If user is logged in and tries to access the root, redirect to chat
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/chat', request.url));
  }
  
  // If user is not logged in and tries to access root, let them.
  if (!user && pathname === '/') {
     return NextResponse.next();
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
