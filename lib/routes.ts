/**
 * Application routes constants
 * Route groups (folders with parentheses) don't affect the URL structure
 * So (admin)/dashboard maps to /admin/dashboard in the URL
 * So (auth)/login maps to /auth/login in the URL
 *
 * Namun karena sudah menggunakan route groups untuk organisasi,
 * routes tetap menggunakan prefix sesuai URL yang dihasilkan
 */

export const ROUTES = {
  // Auth routes - dari (auth) folder
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  // Error pages
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/unauthorized',
  },
  // Admin routes - dari (admin) folder
  ADMIN: {
    DASHBOARD: '/dashboard',
    MANAJEMEN_USER: '/manajemen-user',
    MANAJEMEN_MATA_KULIAH: '/manajemen-mata-kuliah',
    SEMESTER_ANTARA: '/semester-antara',
    PENDAFTARAN: '/pendaftaran',
    MANAJEMEN_JADWAL: '/manajemen-jadwal',
    PENGATURAN: '/pengaturan',
  },
  // Mahasiswa routes
  MAHASISWA: {
    DASHBOARD: '/mahasiswa',
    PENDAFTARAN: '/mahasiswa/pendaftaran',
    RIWAYAT: '/mahasiswa/riwayat',
    JADWAL: '/mahasiswa/jadwal',
    UNDUHAN: '/mahasiswa/unduhan',
    PENGATURAN: '/mahasiswa/pengaturan',
  },
} as const;
