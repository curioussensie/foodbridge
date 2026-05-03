import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/donor/register');
  
  if (!token && !isAuthPage) {
    if (request.nextUrl.pathname.startsWith('/donor') || request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/recipient')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Very basic check - deep token verification happens in the API routes using jsonwebtoken
  // since edge runtime doesn't support jsonwebtoken library directly without jose or similar.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/donor/:path*', '/admin/:path*', '/recipient/:path*', '/login'],
};
