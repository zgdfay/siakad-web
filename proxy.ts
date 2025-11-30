import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/lib/routes';

// Routes yang tidak perlu authentication
const publicRoutes = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
  '/unauthorized',
  '/',
];

const authRoutes = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
];

// Admin routes yang perlu proteksi
const adminRoutes = [
  ROUTES.ADMIN.DASHBOARD,
  ROUTES.ADMIN.MANAJEMEN_USER,
  ROUTES.ADMIN.MANAJEMEN_MATA_KULIAH,
  ROUTES.ADMIN.SEMESTER_ANTARA,
  ROUTES.ADMIN.PENDAFTARAN,
  ROUTES.ADMIN.PENGATURAN,
];

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle reset password page dengan token
  if (pathname.startsWith(ROUTES.AUTH.RESET_PASSWORD)) {
    const token = searchParams.get('token');
    
    // Jika tidak ada token, redirect ke forgot password
    if (!token) {
      return NextResponse.redirect(new URL(ROUTES.AUTH.FORGOT_PASSWORD, request.url));
    }

    // Validasi token format (harus hex string 64 karakter)
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.redirect(new URL(`${ROUTES.AUTH.FORGOT_PASSWORD}?error=invalid_token`, request.url));
    }

    // Allow access ke reset password page dengan valid token
    return NextResponse.next();
  }

  // Check if pathname is a public route
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // Allow public routes - tidak perlu authentication
  if (isPublicRoute) {
    // Jika sudah login dan akses auth routes (bukan root path), redirect ke dashboard sesuai role
    const sessionCookie = request.cookies.get('siakad_session');
    if (sessionCookie && pathname !== '/' && authRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
      try {
        const user = JSON.parse(sessionCookie.value);
        // Validasi user object memiliki property yang diperlukan
        if (user && user.id && user.role) {
          if (user.role === 'ADMIN') {
            return NextResponse.redirect(new URL(ROUTES.ADMIN.DASHBOARD, request.url));
          } else if (user.role === 'DOSEN') {
            return NextResponse.redirect(new URL('/dosen', request.url));
          } else if (user.role === 'MAHASISWA') {
            return NextResponse.redirect(new URL(ROUTES.MAHASISWA.DASHBOARD, request.url));
          }
        }
      } catch (error) {
        // Invalid session, clear cookie dan allow access ke public route
        const response = NextResponse.next();
        response.cookies.set('siakad_session', '', {
          expires: new Date(0),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
        return response;
      }
    }
    // Public route (termasuk root path) - langsung allow access tanpa redirect
    return NextResponse.next();
  }

  // Check authentication
  const sessionCookie = request.cookies.get('siakad_session');
  
  if (!sessionCookie) {
    // Not authenticated, redirect to login
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Parse user from session
  let user;
  try {
    user = JSON.parse(sessionCookie.value);
    // Validasi user object memiliki property yang diperlukan
    if (!user || !user.id || !user.role) {
      throw new Error('Invalid user object');
    }
  } catch (error) {
    // Invalid session, clear cookie dan redirect to login
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('siakad_session', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return response;
  }

  // Check role-based access for admin routes
  if (adminRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    // Check if user is ADMIN
    if (user.role !== 'ADMIN') {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } else if (pathname.startsWith(ROUTES.MAHASISWA.DASHBOARD) || pathname.startsWith(ROUTES.MAHASISWA.PENDAFTARAN) || pathname.startsWith(ROUTES.MAHASISWA.RIWAYAT) || pathname.startsWith(ROUTES.MAHASISWA.PENGATURAN) || pathname.startsWith(ROUTES.MAHASISWA.JADWAL) || pathname.startsWith(ROUTES.MAHASISWA.UNDUHAN)) {
    if (user.role !== 'MAHASISWA') {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } else if (pathname.startsWith('/dosen')) {
    if (user.role !== 'DOSEN') {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
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

