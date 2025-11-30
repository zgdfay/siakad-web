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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Text Content */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              Akses ditolak
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda yakin ini adalah kesalahan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={getDashboardRoute()}>
                Kembali ke Beranda
              </Link>
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto">
              Hubungi Dukungan
            </Button>
          </div>
        </div>

        {/* Right Side - Large 403 Number */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="text-[120px] sm:text-[180px] lg:text-[240px] font-light text-foreground/10 select-none">
            403
          </div>
        </div>
      </div>
    </div>
  );
}

