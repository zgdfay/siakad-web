'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

export function CTASection() {
  const router = useRouter();

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Siap Memulai?
          </h3>
          <p className="text-lg text-primary-foreground/90">
            Daftarkan diri Anda sekarang dan nikmati kemudahan dalam mengelola
            administrasi akademik secara digital.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push(ROUTES.AUTH.REGISTER)}
              className="w-full sm:w-auto">
              <i className="fa-solid fa-user-plus mr-2"></i>
              Daftar Sekarang
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              className="w-full sm:w-auto bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <i className="fa-solid fa-right-to-bracket mr-2"></i>
              Masuk ke Akun
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

