/**
 * Utility functions untuk authentication
 */

export interface User {
  id: string;
  nim: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'DOSEN' | 'MAHASISWA';
  status: 'AKTIF' | 'NONAKTIF';
}

/**
 * Get user data from localStorage
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr) as User;
    return user;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}

/**
 * Set user data to localStorage
 */
export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Remove user data from localStorage
 */
export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getUser() !== null;
}

/**
 * Check if user has specific role
 */
export function hasRole(role: User['role']): boolean {
  const user = getUser();
  return user?.role === role;
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) {
    return '??';
  }
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

