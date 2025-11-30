'use client';

import { useEffect, useState } from 'react';
import { User, getUserInitials } from '@/lib/auth';

interface UserProviderProps {
  children: (user: User | null) => React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  return <>{children(user)}</>;
}

export function formatUserForSidebar(user: User | null) {
  if (!user) return undefined;

  return {
    name: user.name || 'User',
    email: user.email,
    initials: getUserInitials(user.name || 'User'),
  };
}

