'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { UserProvider, formatUserForSidebar } from '@/components/layout/user-provider';
import { User } from '@/lib/auth';

interface MahasiswaLayoutWrapperProps {
  children: ReactNode;
}

export function MahasiswaLayoutWrapper({ children }: MahasiswaLayoutWrapperProps) {
  const navItems = [
    {
      href: '/mahasiswa',
      label: 'Dashboard',
      icon: 'fa-solid fa-house',
    },
    {
      href: '/mahasiswa/pendaftaran',
      label: 'Pendaftaran',
      icon: 'fa-file-pen',
    },
    {
      href: '/mahasiswa/riwayat',
      label: 'Riwayat',
      icon: 'fa-clock-rotate-left',
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
            brandName="Portal Mahasiswa"
            brandSubtitle="ITB YADIKA PASURUAN"
            brandHref="/mahasiswa"
            navItems={navItems}
            user={user ? formatUserForSidebar(user) : undefined}
            logoutHref="/auth/login"
            logoutLabel="Keluar"
            settingHref="/mahasiswa/pengaturan"
          />

          {/* Main Content */}
          <div className="ml-64">
            <header className="sticky top-0 z-10 bg-white border-b">
              <div className="flex h-16 items-center justify-between px-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Portal Mahasiswa
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">Mahasiswa</span>
                </div>
              </div>
            </header>

            <main className="p-6">{children}</main>
          </div>
        </div>
      )}
    </UserProvider>
  );
}

