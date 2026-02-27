import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Keuangan | Siakad",
  description: "Sistem Informasi Akademik ITB YADIKA - Panel Keuangan",
};

export default function KeuanganDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard Keuangan
          </h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang di Panel Keuangan Siakad Semester Antara.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              {" "}
              Total Pembayaran Masuk
            </h3>
            <i className="fa-solid fa-money-bill-wave text-muted-foreground"></i>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">...</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              {" "}
              Belum Diverifikasi
            </h3>
            <i className="fa-solid fa-clock-rotate-left text-muted-foreground"></i>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">...</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium"> Lunas</h3>
            <i className="fa-solid fa-check text-muted-foreground"></i>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
