import { ReactNode } from 'react';
import { MahasiswaLayoutWrapper } from '@/components/layout/mahasiswa-layout-wrapper';

export default function MahasiswaLayout({ children }: { children: ReactNode }) {
  return <MahasiswaLayoutWrapper>{children}</MahasiswaLayoutWrapper>;
}
