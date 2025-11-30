'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

export function NavbarSection() {
  const router = useRouter();

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <Image
                src="/logo/itb-yadika.png"
                alt="ITB YADIKA PASURUAN"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground leading-tight">
                SIAKAD 4.0
              </h1>
              <p className="text-[10px] text-muted-foreground">
                ITB YADIKA PASURUAN
              </p>
            </div>
          </Link>

          {/* Navigation Items - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Fitur
            </Link>
            <Link
              href="#about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Tentang
            </Link>
            <Link
              href="#calendar"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Kalender
            </Link>
          </div>

          {/* Login Button */}
          <Button
            onClick={() => router.push(ROUTES.AUTH.LOGIN)}
            className="bg-primary hover:bg-primary/90">
            <i className="fa-solid fa-right-to-bracket mr-2"></i>
            Masuk
          </Button>
        </div>
      </div>
    </nav>
  );
}

