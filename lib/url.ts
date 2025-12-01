import { NextRequest } from 'next/server';

/**
 * Get the base URL for the application
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL (explicitly set)
 * 2. VERCEL_URL (automatically available in Vercel)
 * 3. Request headers (from incoming request)
 * 4. localhost (development fallback)
 */
export function getBaseUrl(request?: NextRequest): string {
  // 1. Use explicit NEXT_PUBLIC_APP_URL if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // 2. Use VERCEL_URL if available (automatically set by Vercel)
  // VERCEL_URL format: your-app.vercel.app (without protocol)
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL;
    // Check if it already has protocol
    if (vercelUrl.startsWith('http://') || vercelUrl.startsWith('https://')) {
      return vercelUrl;
    }
    return `https://${vercelUrl}`;
  }

  // 3. Try to get from request headers
  if (request) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host');
    if (host) {
      return `${protocol}://${host}`;
    }
  }

  // 4. Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // 5. Production fallback (should not reach here if configured correctly)
  console.warn('⚠️  Base URL tidak ditemukan. Pastikan NEXT_PUBLIC_APP_URL atau VERCEL_URL ter-set.');
  return 'https://localhost:3000'; // Fallback, but should be configured
}

