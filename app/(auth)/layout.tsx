import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    absolute: 'Autentikasi - Siakad ITB YADIKA PASURUAN',
  },
  description:
    'Halaman autentikasi Sistem Informasi Akademik ITB YADIKA PASURUAN. Login atau daftar untuk mengakses portal mahasiswa.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 sm:gap-4 cursor-pointer">
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
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <a
                href="tel:+623434567890"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-xs sm:text-sm">
                <i className="fa-solid fa-phone text-[10px] sm:text-xs"></i>
                <span className="hidden sm:inline">(0343) 746000</span>
                <span className="sm:hidden">Telp</span>
              </a>
              <a
                href="mailto:info@itbyadika.ac.id"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-xs sm:text-sm">
                <i className="fa-solid fa-envelope text-[10px] sm:text-xs"></i>
                <span className="hidden sm:inline">info@itbyadika.ac.id</span>
                <span className="sm:hidden">Email</span>
              </a>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
