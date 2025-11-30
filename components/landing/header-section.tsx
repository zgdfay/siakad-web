'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

export function HeaderSection() {
  const router = useRouter();

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
              <Image
                src="/logo/itb-yadika.png"
                alt="ITB YADIKA PASURUAN"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                SISTEM INFORMASI AKADEMIK 4.0
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Institut Teknologi dan Bisnis Yadika Pasuruan
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              className="text-xs sm:text-sm">
              <i className="fa-solid fa-right-to-bracket mr-2"></i>
              Masuk
            </Button>
            <Button
              onClick={() => router.push(ROUTES.AUTH.REGISTER)}
              className="text-xs sm:text-sm">
              <i className="fa-solid fa-user-plus mr-2"></i>
              Daftar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

