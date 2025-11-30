'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Text Content */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              Halaman tidak ditemukan
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Jika Anda mengetik URL secara langsung, pastikan ejaannya benar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={ROUTES.AUTH.LOGIN}>Kembali ke Beranda</Link>
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

        {/* Right Side - Large 404 Number */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="text-[120px] sm:text-[180px] lg:text-[240px] font-light text-foreground/10 select-none">
            404
          </div>
        </div>
      </div>
    </div>
  );
}
