import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Dosen | Siakad",
  description: "Sistem Informasi Akademik ITB YADIKA - Panel Dosen",
};

export default function DosenDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard Dosen
          </h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang di Panel Dosen Semester Antara ITB YADIKA.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-2">Informasi Mengajar</h3>
        <p className="text-muted-foreground">
          Silakan akses menu Jadwal Mengajar untuk melihat kelas yang ditugaskan
          kepada Anda pada Semester Antara ini.
        </p>
      </div>
    </div>
  );
}
