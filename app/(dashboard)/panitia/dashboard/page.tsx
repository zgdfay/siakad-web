"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Users, FileWarning, CalendarCheck } from "lucide-react";

export default function PanitiaDashboard() {
  const [metrics, setMetrics] = useState({
    totalPendaftaran: 0,
    belumDiverifikasi: 0,
    jadwalDipublish: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/panitia/dashboard");
        if (!res.ok) throw new Error("Gagal mengambil data dashboard");
        const data = await res.json();
        setMetrics({
          totalPendaftaran: data.totalPendaftaran || 0,
          belumDiverifikasi: data.belumDiverifikasi || 0,
          jadwalDipublish: data.jadwalDipublish || 0,
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
            Dashboard Panitia SA
          </h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang di Panel Panitia Semester Antara ITB YADIKA.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Total Pendaftar
            </h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics.totalPendaftaran}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Mahasiswa mendaftar Semester Antara periode ini
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Menunggu Verifikasi KHS
            </h3>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">
                {metrics.belumDiverifikasi}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Pendaftaran yang belum diverifikasi kelayakannya
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Jadwal Kelas (Published)
            </h3>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics.jadwalDipublish}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Jadwal kelas aktif untuk mahasiswa dan dosen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
