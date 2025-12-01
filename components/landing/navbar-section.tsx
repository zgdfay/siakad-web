'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { User } from '@/lib/auth';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Refresh user when page becomes visible (e.g., after login in another tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return ROUTES.AUTH.LOGIN;
    if (user.role === 'ADMIN') return ROUTES.ADMIN.DASHBOARD;
    if (user.role === 'MAHASISWA') return ROUTES.MAHASISWA.DASHBOARD;
    if (user.role === 'DOSEN') return ROUTES.MAHASISWA.DASHBOARD; // DOSEN bisa pakai route mahasiswa untuk sementara
    return ROUTES.AUTH.LOGIN;
  };

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
    setIsMobileMenuOpen(false); // Close mobile menu on click
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

          {/* Desktop Button - Hidden on mobile */}
          <div className="hidden md:block">
            <Button
              onClick={() =>
                router.push(user ? getDashboardRoute() : ROUTES.AUTH.LOGIN)
              }
              className="bg-primary hover:bg-primary/90">
              {user ? 'Dashboard' : 'Login'}
              <i
                className={cn(
                  'ml-2',
                  user ? 'fa-solid fa-house' : 'fa-solid fa-arrow-right-long'
                )}></i>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu">
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}>
          <div className="py-4 space-y-3 border-t">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  'block px-4 py-2 text-sm transition-colors rounded-md',
                  activeSection === item.id
                    ? 'text-primary font-semibold bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-accent'
                )}>
                {item.label}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push(user ? getDashboardRoute() : ROUTES.AUTH.LOGIN);
                }}
                className="w-full bg-primary hover:bg-primary/90">
                {user ? 'Dashboard' : 'Login'}
                <i
                  className={cn(
                    'ml-2',
                    user ? 'fa-solid fa-gauge' : 'fa-solid fa-arrow-right-long'
                  )}></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
