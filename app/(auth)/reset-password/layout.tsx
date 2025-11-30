import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Reset Password - Siakad ITB YADIKA PASURUAN',
  },
  description:
    'Reset password untuk Sistem Informasi Akademik ITB YADIKA PASURUAN. Masukkan password baru Anda.',
  keywords: [
    'reset password',
    'ubah password',
    'ITB YADIKA PASURUAN',
    'sistem informasi akademik',
  ],
  robots: {
    index: false,
    follow: true,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

