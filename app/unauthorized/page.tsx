'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { useEffect, useState } from 'react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user role untuk menentukan redirect yang tepat
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user?.role || null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const getDashboardRoute = () => {
    if (userRole === 'ADMIN') {
      return ROUTES.ADMIN.DASHBOARD;
    } else if (userRole === 'MAHASISWA') {
      return ROUTES.MAHASISWA.DASHBOARD;
    }
    return ROUTES.AUTH.LOGIN;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-destructive/10 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-lock text-destructive text-6xl"></i>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Akses Ditolak
            </h1>
            <p className="text-muted-foreground">
              Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-left">
          <p className="font-medium text-foreground">Kemungkinan penyebab:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Anda tidak memiliki role yang diperlukan</li>
            <li>Session Anda telah kedaluwarsa</li>
            <li>Halaman ini memerlukan autentikasi khusus</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button onClick={() => router.back()} variant="outline" size="lg">
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Kembali
          </Button>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href={getDashboardRoute()}>
              <i className="fa-solid fa-house mr-2"></i>
              Ke Dashboard
            </Link>
          </Button>
        </div>

        <div className="pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Jika Anda yakin ini adalah kesalahan, silakan hubungi administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

