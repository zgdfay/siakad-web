'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

// Sidebar Context
interface SidebarContextType {
  isMobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}

// Sidebar Provider Component
export function SidebarProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <SidebarContext.Provider value={{ isMobileOpen, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

interface SidebarProps {
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  brandName: string;
  brandSubtitle?: string;
  brandHref?: string;
  navItems: NavItem[];
  utilityItems?: NavItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
  logoutHref?: string;
  logoutLabel?: string;
  settingHref?: string;
}

export function Sidebar({
  logo,
  brandName,
  brandSubtitle,
  brandHref,
  navItems,
  utilityItems = [],
  user,
  logoutHref = '/login',
  logoutLabel = 'Keluar',
  settingHref,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileOpen, closeMobile } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      // Clear localStorage (backward compatibility)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }

      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Redirect to login
      router.push(logoutHref);
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if API call fails
      router.push(logoutHref);
      router.refresh();
    }
  };

  // Auto-detect brand href dari navItems pertama jika tidak disediakan
  const defaultBrandHref = brandHref || navItems[0]?.href || '/';

  const isActive = (href: string) => {
    // Normalize pathname (remove trailing slash)
    const normalizedPathname = pathname.replace(/\/$/, '');
    const normalizedHref = href.replace(/\/$/, '');
    
    // Exact match untuk dashboard atau root paths
    if (normalizedHref === '/mahasiswa' || normalizedHref === '/admin' || normalizedHref === '/admin/dashboard') {
      return normalizedPathname === normalizedHref;
    }
    
    // Prefix match untuk sub-paths (pastikan tidak match parent path)
    if (normalizedPathname.startsWith(normalizedHref)) {
      // Pastikan tidak match parent path (misalnya /admin tidak match /admin/dashboard)
      const nextChar = normalizedPathname[normalizedHref.length];
      return nextChar === undefined || nextChar === '/';
    }
    
    return false;
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-sidebar-foreground/70 hover:bg-primary/10 hover:text-primary'
        )}>
        <i className={cn(
          'fa-solid w-5 text-center transition-colors',
          item.icon,
          active ? 'text-primary' : 'text-sidebar-foreground/60 group-hover:text-primary'
        )}></i>
        <span className={cn(
          'flex-1 transition-colors',
          active ? 'text-primary font-semibold' : 'group-hover:text-primary'
        )}>{item.label}</span>
        {item.badge && item.badge > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-destructive rounded-full">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
        {/* Logo & Brand */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6 shrink-0">
          <Link href={defaultBrandHref} className="flex items-center gap-3 w-full">
            {logo && (
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width || 40}
                  height={logo.height || 40}
                  className="object-contain"
                  priority
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-sidebar-foreground leading-tight truncate">
                {brandName}
              </h1>
              {brandSubtitle && (
                <p className="text-[10px] text-sidebar-foreground/70 truncate">
                  {brandSubtitle}
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Utility Items */}
        {utilityItems.length > 0 && (
          <>
            <Separator className="mx-3 my-2" />
            <nav className="px-3 py-2 space-y-1.5">
              {utilityItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </>
        )}

        {/* User Profile & Dropdown Menu */}
        <div className="border-t border-sidebar-border p-4 shrink-0">
          {user && (
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
                    <Avatar className="h-10 w-10 cursor-pointer focus:outline-none focus:ring-0">
                      <AvatarImage src={user.avatar} alt={user.name || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.initials || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-sidebar-foreground/70 truncate">
                        {user.email}
                      </p>
                    </div>
                    <i className="fa-solid fa-chevron-down text-xs text-sidebar-foreground/50"></i>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isMobile ? "end" : "start"}
                  side={isMobile ? "top" : "right"}
                  sideOffset={isMobile ? 4 : 8}
                  className={cn(
                    "w-56 mb-4",
                    isMobile && "max-w-[calc(100vw-2rem)]"
                  )}>
                  <DropdownMenuLabel className="px-3 py-2.5">
                    <div className="flex flex-col space-y-0.5 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-foreground/70 leading-tight truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {settingHref && (
                    <DropdownMenuItem asChild>
                      <Link href={settingHref} className="cursor-pointer">
                        <i className="fa-solid fa-gear mr-2 w-4 text-center"></i>
                        <span>Pengaturan</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {settingHref && <DropdownMenuSeparator />}
                  <DropdownMenuItem asChild>
                    <AlertDialogTrigger asChild>
                      <button className="w-full flex items-center text-destructive group">
                        <i className="fa-solid fa-right-from-bracket mr-2 w-4 text-center group-hover:text-red-600 transition-colors"></i>
                        <span className="group-hover:text-red-600 transition-colors">{logoutLabel}</span>
                      </button>
                    </AlertDialogTrigger>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Keluar dari akun?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda akan keluar dari Portal. Pastikan tidak ada data yang belum disimpan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white">
                    Keluar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </aside>
    </>
  );
}

// Mobile Menu Toggle Button Component
export function SidebarToggle() {
  const { isMobileOpen, toggleMobile } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={toggleMobile}
      aria-label="Toggle sidebar">
      {isMobileOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <Menu className="h-6 w-6" />
      )}
    </Button>
  );
}

