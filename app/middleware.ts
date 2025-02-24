import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('auth_token'); // Replace with your actual auth check
  const isAuthPath = request.nextUrl.pathname.startsWith('/auth');
  const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isRootPath = request.nextUrl.pathname === '/';

  // Redirect root to login if not authenticated, dashboard if authenticated
  if (isRootPath) {
    return NextResponse.redirect(new URL(isAuthenticated ? '/dashboard' : '/auth/login', request.url));
  }

  // Redirect to login if trying to access protected routes while not authenticated
  if (!isAuthenticated && (isDashboardPath || isAdminPath)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Redirect to dashboard if trying to access auth pages while authenticated
  if (isAuthenticated && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add additional admin role check for admin routes
  if (isAdminPath) {
    const isAdmin = request.cookies.get('user_role')?.value === 'admin'; // Replace with your actual admin check
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};