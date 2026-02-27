import { ReactNode } from "react";
import { DashboardLayoutWrapper } from "@/components/layout/dashboard-layout-wrapper";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
