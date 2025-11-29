'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { UserProvider, formatUserForSidebar } from '@/components/layout/user-provider';
import { User } from '@/lib/auth';

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const navItems = [
    {
      href: '/admin',
      label: 'Manajemen Dashboard',
      icon: 'fa-solid fa-house',
    },
    {
      href: '/admin/manajemen-user',
      label: 'Manajemen User',
      icon: 'fa-solid fa-users',
    },
    {
      href: '/admin/pendaftaran',
      label: 'Manajemen Pendaftaran',
      icon: 'fa-file-pen',
    },
    {
      href: '/admin/semester-antara',
      label: 'Manajemen Semester Antara',
      icon: 'fa-calendar-days',
    },
    {
      href: '/admin/manajemen-mata-kuliah',
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
            brandHref="/admin"
            navItems={navItems}
            user={formatUserForSidebar(user)}
            logoutHref="/auth/login"
            logoutLabel="Keluar"
            settingHref="/admin/pengaturan"
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

