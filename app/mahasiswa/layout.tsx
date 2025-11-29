import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export default function MahasiswaLayout({ children }: { children: ReactNode }) {
  // Mock user data - akan diganti dengan data dari session/auth
  const user = {
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@mhs.itbyadika.ac.id',
    initials: 'AF',
  };

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
        user={user}
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
  );
}
