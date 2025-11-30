'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

const navItems = [
  { label: 'Beranda', href: '#' },
  { label: 'Tentang', href: '#about' },
  { label: 'Fitur', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

export function FooterSection() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

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
    <footer className="bg-primary text-primary-foreground py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <Image
                src="/logo/itb-yadika.png"
                alt="ITB YADIKA"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h4 className="font-bold text-primary-foreground text-lg">
              SIAKAD 4.0
            </h4>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                {item.label}
              </Link>
            ))}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Login
            </Link>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Register
            </Link>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <a
              href="https://www.youtube.com/channel/UCoFB-AQ8EZFJ2GFZfzpUZdA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors"
              aria-label="YouTube">
              <i className="fa-brands fa-youtube"></i>
            </a>
            <a
              href="https://www.instagram.com/stie.yadika.bangil/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors"
              aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://maps.app.goo.gl/6KmibhTV1yKgt3Ky6"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors"
              aria-label="Google Maps">
              <i className="fa-solid fa-map-location-dot"></i>
            </a>
            <a
              href="tel:(0343) 746000"
              className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors"
              aria-label="Telepon">
              <i className="fa-solid fa-phone"></i>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-primary-foreground/60">
            <p>© {currentYear} ITB YADIKA Pasuruan, All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
