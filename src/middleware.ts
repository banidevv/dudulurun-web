import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-fallback-jwt-secret'
);

export async function middleware(request: NextRequest) {
  // Only run middleware for admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Skip middleware for admin login page and API
  if (request.nextUrl.pathname === '/admin/login' || 
      request.nextUrl.pathname === '/api/admin/auth') {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token');

  console.log('Request path:', request.nextUrl.pathname);
  console.log('Admin token:', token?.value ? 'Present' : 'Missing');

  if (!token) {
    console.log('No admin token found, redirecting to login');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const { payload } = await jose.jwtVerify(token.value, JWT_SECRET);
    console.log('Token verified successfully:', payload);
    return NextResponse.next();
  } catch (error) {
    console.log('Token verification failed:', error);
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}; 