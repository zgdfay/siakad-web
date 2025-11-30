'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { UserProvider, formatUserForSidebar } from '@/components/layout/user-provider';
import { User } from '@/lib/auth';

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

import { ROUTES } from '@/lib/routes';

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const navItems = [
    {
      href: ROUTES.ADMIN.DASHBOARD,
      label: 'Dashboard',
      icon: 'fa-solid fa-house',
    },
    {
      href: ROUTES.ADMIN.MANAJEMEN_USER,
      label: 'Manajemen User',
      icon: 'fa-solid fa-users',
    },
    {
      href: ROUTES.ADMIN.PENDAFTARAN,
      label: 'Manajemen Pendaftaran',
      icon: 'fa-solid fa-file-pen',
    },
    {
      href: ROUTES.ADMIN.SEMESTER_ANTARA,
      label: 'Manajemen Semester Antara',
      icon: 'fa-solid fa-calendar-days',
    },
    {
      href: ROUTES.ADMIN.MANAJEMEN_MATA_KULIAH,
      label: 'Manajemen Mata Kuliah',
      icon: 'fa-solid fa-book-open',
    },
  ];

  return (
    <UserProvider>
      {(user) => (
        <div className="min-h-screen bg-background">
          <Sidebar
            logo={{
              src: '/logo/itb-yadika.png',
              alt: 'ITB YADIKA PASURUAN',
              width: 40,
              height: 40,
            }}
            brandName="Siakad Admin"
            brandSubtitle="ITB YADIKA PASURUAN"
            brandHref={ROUTES.ADMIN.DASHBOARD}
            navItems={navItems}
            user={user ? formatUserForSidebar(user) : undefined}
            logoutHref="/login"
            logoutLabel="Keluar"
            settingHref={ROUTES.ADMIN.PENGATURAN}
          />

          {/* Main Content */}
          <div className="ml-64">
            <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
              <div className="flex h-16 items-center justify-between px-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Panel Admin
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">Admin</span>
                </div>
              </div>
            </header>
            
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      )}
    </UserProvider>
  );
}

