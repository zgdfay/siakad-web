'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-triangle-exclamation text-primary text-6xl"></i>
              </div>
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-destructive">404</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-muted-foreground">
              Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button onClick={() => router.back()} variant="outline" size="lg">
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Kembali
          </Button>
          <Button asChild size="lg">
            <Link href={ROUTES.AUTH.LOGIN}>
              <i className="fa-solid fa-house mr-2"></i>
              Ke Halaman Utama
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

