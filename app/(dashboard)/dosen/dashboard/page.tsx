"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, BookOpen, Users } from "lucide-react";

export default function DosenDashboard() {
  const [metrics, setMetrics] = useState({
    totalKelas: 0,
    mahasiswaBelumDinilai: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/dosen/dashboard");
        if (!res.ok) throw new Error("Gagal mengambil data dashboard");
        const data = await res.json();
        setMetrics({
          totalKelas: data.totalKelas || 0,
          mahasiswaBelumDinilai: data.mahasiswaBelumDinilai || 0,
        });
      } catch (error) {
        toast.error("Gagal memuat informasi dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Total Kelas Aktif
            </h3>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{metrics.totalKelas}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Jadwal mengajar Semester Antara saat ini
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Menunggu Penilaian
            </h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">
                {metrics.mahasiswaBelumDinilai}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Mahasiswa yang belum diberikan nilai akhir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
