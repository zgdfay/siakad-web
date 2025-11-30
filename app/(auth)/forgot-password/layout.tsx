import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Lupa Password - Siakad ITB YADIKA PASURUAN',
  },
  description:
    'Reset password untuk Sistem Informasi Akademik ITB YADIKA PASURUAN. Masukkan email untuk menerima link reset password.',
  keywords: [
    'lupa password',
    'reset password',
    'ITB YADIKA PASURUAN',
    'sistem informasi akademik',
  ],
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

