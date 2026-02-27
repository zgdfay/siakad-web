"use client";

import { ReactNode } from "react";
import {
  Sidebar,
  SidebarToggle,
  SidebarProvider,
} from "@/components/layout/sidebar";
import {
  UserProvider,
  formatUserForSidebar,
} from "@/components/layout/user-provider";
import { User } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

interface DashboardLayoutWrapperProps {
  children: ReactNode;
}

export function DashboardLayoutWrapper({
  children,
}: DashboardLayoutWrapperProps) {
  // Define all possible navigation items with minimum role requirements
  const allNavItems = [
    // --- ADMIN SPECIFIC ---
    {
      href: ROUTES.ADMIN.DASHBOARD,
      label: "Dashboard Admin",
      icon: "fa-solid fa-house-chimney-window",
      roles: ["ADMIN"],
    },
    {
      href: ROUTES.ADMIN.MANAJEMEN_USER,
      label: "Manajemen User",
      icon: "fa-solid fa-users",
      roles: ["ADMIN"],
    },
    {
      href: ROUTES.ADMIN.SEMESTER_ANTARA,
      label: "Manajemen Semester Antara",
      icon: "fa-solid fa-calendar-days",
      roles: ["ADMIN"],
    },
    {
      href: ROUTES.ADMIN.MANAJEMEN_MATA_KULIAH,
      label: "Manajemen Mata Kuliah",
      icon: "fa-solid fa-book-open",
      roles: ["ADMIN"],
    },

    // --- PANITIA ---
    {
      href: ROUTES.PANITIA.DASHBOARD,
      label: "Dashboard Panitia",
      icon: "fa-solid fa-house",
      roles: ["PANITIA"],
    },
    {
      href: ROUTES.PANITIA.VERIFIKASI_KHS,
      label: "Verifikasi KHS",
      icon: "fa-solid fa-file-signature",
      roles: ["ADMIN", "PANITIA"],
    },
    {
      href: ROUTES.PANITIA.PENDAFTARAN,
      label: "Manajemen Pendaftaran",
      icon: "fa-solid fa-file-pen",
      roles: ["ADMIN", "PANITIA"],
    },
    {
      href: ROUTES.PANITIA.MANAJEMEN_JADWAL,
      label: "Publish Jadwal",
      icon: "fa-solid fa-calendar-check",
      roles: ["ADMIN", "PANITIA"],
    },
    {
      href: ROUTES.PANITIA.REKAP_PESERTA,
      label: "Rekap Peserta",
      icon: "fa-solid fa-users-viewfinder",
      roles: ["ADMIN", "PANITIA"],
    },
    {
      href: ROUTES.PANITIA.ARSIP_NILAI,
      label: "Arsip Nilai",
      icon: "fa-solid fa-box-archive",
      roles: ["ADMIN", "PANITIA"],
    },

    // --- KEUANGAN ---
    {
      href: ROUTES.KEUANGAN.DASHBOARD,
      label: "Dashboard Keuangan",
      icon: "fa-solid fa-house",
      roles: ["KEUANGAN"],
    },
    {
      href: ROUTES.KEUANGAN.PEMBAYARAN,
      label: "Verifikasi Pembayaran",
      icon: "fa-solid fa-money-bill-wave",
      roles: ["ADMIN", "KEUANGAN"],
    },

    // --- DOSEN ---
    {
      href: ROUTES.DOSEN.DASHBOARD,
      label: "Dashboard Dosen",
      icon: "fa-solid fa-house",
      roles: ["DOSEN"], // Admin typically doesn't teach, but can add if needed
    },
    {
      href: ROUTES.DOSEN.JADWAL,
      label: "Jadwal Mengajar",
      icon: "fa-solid fa-calendar-check",
      roles: ["DOSEN"],
    },
    {
      href: ROUTES.DOSEN.NILAI,
      label: "Input Nilai",
      icon: "fa-solid fa-star",
      roles: ["DOSEN"],
    },
  ];

  return (
    <SidebarProvider>
      <UserProvider>
        {(user) => {
          // Filter nav items based on user's role
          const filteredNavItems = user
            ? allNavItems.filter((item) => item.roles.includes(user.role))
            : [];

          // Determine the fallback dashboard link depending on role
          let dashboardHref = "/";
          let userRoleDisplay = "User";

          if (user?.role === "ADMIN") {
            dashboardHref = ROUTES.ADMIN.DASHBOARD;
            userRoleDisplay = "Admin";
          } else if (user?.role === "PANITIA") {
            dashboardHref = ROUTES.PANITIA.DASHBOARD;
            userRoleDisplay = "Panitia";
          } else if (user?.role === "KEUANGAN") {
            dashboardHref = ROUTES.KEUANGAN.DASHBOARD;
            userRoleDisplay = "Keuangan";
          } else if (user?.role === "DOSEN") {
            dashboardHref = ROUTES.DOSEN.DASHBOARD;
            userRoleDisplay = "Dosen";
          }

          return (
            <div className="min-h-screen bg-background w-full">
              <Sidebar
                logo={{
                  src: "/logo/itb-yadika.png",
                  alt: "ITB YADIKA PASURUAN",
                  width: 40,
                  height: 40,
                }}
                brandName="Siakad"
                brandSubtitle="ITB YADIKA PASURUAN"
                brandHref={dashboardHref}
                navItems={filteredNavItems}
                user={user ? formatUserForSidebar(user) : undefined}
                logoutHref="/login"
                logoutLabel="Keluar"
                settingHref={
                  user?.role === "ADMIN" ? ROUTES.ADMIN.PENGATURAN : undefined
                }
              />

              {/* Main Content */}
              <div className="lg:ml-64 relative min-h-screen flex flex-col">
                <header className="sticky top-0 z-30 bg-white border-b shadow-sm w-full">
                  <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
                    <div className="flex items-center gap-4">
                      <SidebarToggle />
                      <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                        Sistem Informasi Akademik
                      </h2>
                    </div>
                    <div className="flex items-center space-x-4 shrink-0">
                      <span className="hidden sm:inline text-sm text-muted-foreground mr-2 capitalize">
                        {userRoleDisplay}
                      </span>
                    </div>
                  </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 w-full max-w-full overflow-x-hidden">
                  {children}
                </main>
              </div>
            </div>
          );
        }}
      </UserProvider>
    </SidebarProvider>
  );
}
