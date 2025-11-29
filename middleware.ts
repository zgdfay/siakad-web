import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes yang tidak perlu authentication
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/'];
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

// Role-based routes
const roleRoutes: Record<string, string[]> = {
  ADMIN: ['/admin'],
  DOSEN: ['/dosen'],
  MAHASISWA: ['/mahasiswa'],
};

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle reset password page dengan token
  if (pathname.startsWith('/auth/reset-password')) {
    const token = searchParams.get('token');
    
    // Jika tidak ada token, redirect ke forgot password
    if (!token) {
      return NextResponse.redirect(new URL('/auth/forgot-password', request.url));
    }

    // Validasi token format (harus hex string 64 karakter)
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.redirect(new URL('/auth/forgot-password?error=invalid_token', request.url));
    }

    // Allow access ke reset password page dengan valid token
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // Jika sudah login dan akses auth routes, redirect ke dashboard sesuai role
    const sessionCookie = request.cookies.get('siakad_session');
    if (sessionCookie && authRoutes.some((route) => pathname.startsWith(route))) {
      try {
        const user = JSON.parse(sessionCookie.value);
        if (user.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else if (user.role === 'DOSEN') {
          return NextResponse.redirect(new URL('/dosen', request.url));
        } else if (user.role === 'MAHASISWA') {
          return NextResponse.redirect(new URL('/mahasiswa', request.url));
        }
      } catch (error) {
        // Invalid session, continue
      }
    }
    return NextResponse.next();
  }

  // Check authentication
  const sessionCookie = request.cookies.get('siakad_session');
  
  if (!sessionCookie) {
    // Not authenticated, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Parse user from session
  let user;
  try {
    user = JSON.parse(sessionCookie.value);
  } catch (error) {
    // Invalid session, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  if (pathname.startsWith('/admin')) {
    if (user.role !== 'ADMIN') {
      // Redirect to appropriate dashboard
      if (user.role === 'MAHASISWA') {
        return NextResponse.redirect(new URL('/mahasiswa', request.url));
      } else if (user.role === 'DOSEN') {
        return NextResponse.redirect(new URL('/dosen', request.url));
      }
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } else if (pathname.startsWith('/mahasiswa')) {
    if (user.role !== 'MAHASISWA') {
      // Redirect to appropriate dashboard
      if (user.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (user.role === 'DOSEN') {
        return NextResponse.redirect(new URL('/dosen', request.url));
      }
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } else if (pathname.startsWith('/dosen')) {
    if (user.role !== 'DOSEN') {
      // Redirect to appropriate dashboard
      if (user.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (user.role === 'MAHASISWA') {
        return NextResponse.redirect(new URL('/mahasiswa', request.url));
      }
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

