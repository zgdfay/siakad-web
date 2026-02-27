import { ReactNode } from "react";
import { DashboardLayoutWrapper } from "@/components/layout/dashboard-layout-wrapper";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
