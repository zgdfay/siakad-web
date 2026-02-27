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
    PENGATURAN: '/pengaturan',
  },
  // Panitia routes (SA operational tasks)
  PANITIA: {
    DASHBOARD: '/panitia/dashboard',
    VERIFIKASI_KHS: '/panitia/verifikasi-khs',
    PENDAFTARAN: '/panitia/pendaftaran',
    MANAJEMEN_JADWAL: '/panitia/manajemen-jadwal',
    REKAP_PESERTA: '/panitia/rekap-peserta',
    ARSIP_NILAI: '/panitia/arsip-nilai',
  },
  // Keuangan routes
  KEUANGAN: {
    DASHBOARD: '/keuangan/dashboard',
    PEMBAYARAN: '/keuangan/pembayaran',
  },
  // Dosen routes
  DOSEN: {
    DASHBOARD: '/dosen/dashboard',
    JADWAL: '/dosen/jadwal',
    NILAI: '/dosen/nilai',
  },
  // Mahasiswa routes
  MAHASISWA: {
    DASHBOARD: '/mahasiswa',
    PENDAFTARAN: '/mahasiswa/pendaftaran',
    RIWAYAT: '/mahasiswa/riwayat',
    JADWAL: '/mahasiswa/jadwal',
    NILAI: '/mahasiswa/nilai',
    UNDUHAN: '/mahasiswa/unduhan',
    PENGATURAN: '/mahasiswa/pengaturan',
  },
} as const;
