import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Pasuruan | Siakad",
  description: "Sistem Informasi Akademik ITB YADIKA - Panel Panitia",
};

export default function PanitiaDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard Panitia SA
          </h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang di Panel Panitia Semester Antara ITB YADIKA.
          </p>
        </div>
      </div>

      {/* Metrics or Summary can go here */}
    </div>
  );
}
