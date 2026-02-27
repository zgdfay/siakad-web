"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Banknote, Clock, CheckCircle } from "lucide-react";

export default function KeuanganDashboard() {
  const [metrics, setMetrics] = useState({
    totalPendapatan: 0,
    belumDiverifikasi: 0,
    sudahLunas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/keuangan/dashboard");
        if (!res.ok) throw new Error("Gagal mengambil data dashboard");
        const data = await res.json();
        setMetrics({
          totalPendapatan: data.totalPendapatan || 0,
          belumDiverifikasi: data.belumDiverifikasi || 0,
          sudahLunas: data.sudahLunas || 0,
        });
      } catch (error) {
        toast.error("Gagal memuat informasi dashboard keuangan");
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
              Total Pembayaran Masuk
            </h3>
            <Banknote className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="p-6 pt-0">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold text-emerald-600">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(metrics.totalPendapatan)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Dari invoice yang sudah Lunas
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Menunggu Verifikasi
            </h3>
            <Clock className="h-4 w-4 text-amber-500" />
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
              Transfer yang belum divalidasi
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Invoice Lunas
            </h3>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </div>
          <div className="p-6 pt-0">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {metrics.sudahLunas}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Total transaksi selesai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
