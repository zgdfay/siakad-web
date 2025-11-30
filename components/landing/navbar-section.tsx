'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Beranda', href: '#', id: 'hero' },
  { label: 'Tentang', href: '#about', id: 'about' },
  { label: 'Fitur', href: '#features', id: 'features' },
  { label: 'FAQ', href: '#faq', id: 'faq' },
];

export function NavbarSection() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) => item.id);
      const scrollPosition = window.scrollY + 100; // Offset for better detection

      // Check each section
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }

      // If at top, set to hero
      if (window.scrollY < 100) {
        setActiveSection('hero');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  'text-sm transition-colors',
                  activeSection === item.id
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-primary'
                )}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Login Button */}
          <Button
            onClick={() => router.push(ROUTES.AUTH.LOGIN)}
            className="bg-primary hover:bg-primary/90">
            Login
            <i className="fa-solid fa-arrow-right-long ml-2"></i>
          </Button>
        </div>
      </div>
    </nav>
  );
}
