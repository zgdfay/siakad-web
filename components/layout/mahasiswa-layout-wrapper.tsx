'use client';

import { ReactNode } from 'react';
import { Sidebar, SidebarToggle, SidebarProvider } from '@/components/layout/sidebar';
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
      href: '/mahasiswa/jadwal',
      label: 'Jadwal Kuliah',
      icon: 'fa-calendar-days',
    },
    {
      href: '/mahasiswa/riwayat',
      label: 'Riwayat',
      icon: 'fa-clock-rotate-left',
    },
    {
      href: '/mahasiswa/unduhan',
      label: 'Unduhan',
      icon: 'fa-download',
    },
  ];

  return (
    <SidebarProvider>
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
            logoutHref="/login"
            logoutLabel="Keluar"
            settingHref="/mahasiswa/pengaturan"
          />

          {/* Main Content */}
          <div className="lg:ml-64">
            <header className="sticky top-0 z-10 bg-white border-b">
              <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
                <div className="flex items-center gap-4">
                  <SidebarToggle />
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">
                    Portal Mahasiswa
                  </h2>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="hidden sm:inline text-sm text-muted-foreground">Mahasiswa</span>
                </div>
              </div>
            </header>

            <main className="p-4 sm:p-6">{children}</main>
          </div>
        </div>
      )}
      </UserProvider>
    </SidebarProvider>
  );
}

