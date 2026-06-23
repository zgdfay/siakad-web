"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

interface Payment {
  id: string;
  jumlah: number;
  status: "MENUNGGU_VERIFIKASI" | "LUNAS" | "DITOLAK"; // Wait, in Xendit context this might just be PENDING/PAID, but we adapt to existing schema
  updatedAt: string;
  tanggalBayar: string | null;
  pendaftaran: {
    userMaster: {
      name: string;
      nimOrNip: string;
    };
    semester: {
      nama: string;
      tahun: number;
      periode: string;
    };
  };
}

export default function KeuanganPembayaranPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Jalankan sync satu kali saat pertama kali load (membantu localhost tanpa webhook)
    syncXendit();
    
    fetchPayments(true);
    
    // Polling setiap 5 detik untuk update status realtime
    const interval = setInterval(() => {
      fetchPayments(false);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPayments = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await fetch("/api/keuangan/payments");
      if (!res.ok) throw new Error("Gagal mengambil data pembayaran");
      const data = await res.json();
      setPayments(data.payments);
    } catch (error) {
      if (showLoading) toast.error("Gagal memuat data pembayaran");
      console.error(error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const syncXendit = async () => {
    try {
      setIsSyncing(true);
      await fetch("/api/keuangan/payments/sync", { method: "POST" });
      // Setelah sync selesai, refresh data tabel (tanpa loading state penuh)
      fetchPayments(false);
    } catch (error) {
      console.error("Gagal sync Xendit:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredList = payments.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.pendaftaran.userMaster.name?.toLowerCase().includes(searchLower) ||
      p.pendaftaran.userMaster.nimOrNip.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LUNAS":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600">
            Lunas / Terbayar
          </Badge>
        );
      case "DITOLAK":
      case "FAILED":
      case "EXPIRED":
        return <Badge variant="destructive">Gagal / Kadaluarsa</Badge>;
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            Pending
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Data Pembayaran (Xendit)
        </h1>
        <p className="text-muted-foreground mt-2">
          Pantau status pembayaran mahasiswa secara otomatis (Read-Only).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau NIM..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={syncXendit}
            disabled={isSyncing}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <i className="fa-solid fa-arrows-rotate mr-2" />
            )}
            Sinkronisasi Status
          </button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mahasiswa</TableHead>
              <TableHead>Periode SA</TableHead>
              <TableHead>Terakhir Diupdate</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status Pembayaran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    Sedang memuat riwayat pembayaran...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  Belum ada data pembayaran ter-generate.
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">
                      {p.pendaftaran.userMaster.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {p.pendaftaran.userMaster.nimOrNip}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.pendaftaran.semester.nama} (
                    {p.pendaftaran.semester.tahun} -{" "}
                    {p.pendaftaran.semester.periode})
                  </TableCell>
                  <TableCell>
                    {format(new Date(p.updatedAt), "dd MMM yyyy, HH:mm", {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(p.jumlah)}
                  </TableCell>
                  <TableCell>{getStatusBadge(p.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
