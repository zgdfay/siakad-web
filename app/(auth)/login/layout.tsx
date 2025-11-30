import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Login - Siakad ITB YADIKA PASURUAN',
  },
  description:
    'Masuk ke Sistem Informasi Akademik ITB YADIKA PASURUAN. Login menggunakan NIM dan tanggal lahir untuk mengakses portal mahasiswa.',
  keywords: [
    'login siakad',
    'ITB YADIKA PASURUAN',
    'sistem informasi akademik',
    'portal mahasiswa',
    'login mahasiswa',
  ],
  authors: [{ name: 'ITB YADIKA PASURUAN' }],
  openGraph: {
    title: 'Login - Siakad ITB YADIKA PASURUAN',
    description:
      'Masuk ke Sistem Informasi Akademik ITB YADIKA PASURUAN untuk mengakses portal mahasiswa',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Siakad ITB YADIKA PASURUAN',
  },
  twitter: {
    card: 'summary',
    title: 'Login - Siakad ITB YADIKA PASURUAN',
    description:
      'Masuk ke Sistem Informasi Akademik ITB YADIKA PASURUAN untuk mengakses portal mahasiswa',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/auth/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

