import { ReactNode } from 'react';
import { AdminLayoutWrapper } from '@/components/layout/admin-layout-wrapper';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
