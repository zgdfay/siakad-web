import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Daftar Akun - Siakad ITB YADIKA PASURUAN',
  },
  description:
    'Daftar akun baru untuk Sistem Informasi Akademik ITB YADIKA PASURUAN. Buat akun dengan NIM, nama, dan email Anda.',
  keywords: [
    'daftar akun',
    'register',
    'ITB YADIKA PASURUAN',
    'sistem informasi akademik',
    'pendaftaran mahasiswa',
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

