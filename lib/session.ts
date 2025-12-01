/**
 * Server-side session management dengan cookies
 */

import { cookies } from 'next/headers';
import { User } from './auth';

const SESSION_COOKIE_NAME = 'siakad_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

/**
 * Determine if we should use secure cookies
 * In Vercel/production, always use secure cookies for HTTPS
 */
export function shouldUseSecureCookie(): boolean {
  // Always secure in production or if VERCEL_URL is set (Vercel deployment)
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_URL) {
    return true;
  }
  // In development, only use secure if explicitly set
  return process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false;
}

/**
 * Set session cookie dengan user data
 */
export async function setSession(user: User): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Get user dari session cookie
 */
export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }

    const user = JSON.parse(sessionCookie.value) as User;
    return user;
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    return null;
  }
}

/**
 * Clear session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getSession();
  return user !== null;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: User['role']): Promise<boolean> {
  const user = await getSession();
  return user?.role === role;
}

