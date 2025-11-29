import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Mock admin data - akan diganti dengan data dari session/auth
  const admin = {
    name: 'Admin Akademik',
    email: 'admin@itbyadika.ac.id',
    initials: 'AD',
  };

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
        user={admin}
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
  );
}
