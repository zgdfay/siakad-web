'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DetailPendaftaranModal } from '@/components/pendaftaran/detail-pendaftaran-modal';
import { toast } from 'sonner';

interface PendaftaranItem {
  id: string;
  semester: {
    nama: string;
  };
  createdAt: string;
  status: 'MENUNGGU_VERIFIKASI' | 'DITERIMA' | 'DITOLAK' | 'DIBATALKAN';
  totalSKS: number;
  totalBiaya: number;
  detail: Array<{
    semesterMataKuliah: {
      mataKuliah: {
        kode: string;
        nama: string;
        sks: number;
      };
      biaya: number;
    };
  }>;
  payment?: {
    status: string;
    metodePembayaran?: string;
    tanggalBayar?: string;
  } | null;
  catatanAdmin?: string | null;
}

export default function MahasiswaDashboard() {
  const [pendaftaran, setPendaftaran] = useState<PendaftaranItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPendaftaran, setSelectedPendaftaran] = useState<PendaftaranItem | null>(null);

  useEffect(() => {
    const fetchPendaftaran = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/pendaftaran/user/me');
        if (!response.ok) throw new Error('Gagal mengambil data pendaftaran');
        const data = await response.json();
        setPendaftaran(data.pendaftaran || []);
      } catch (error) {
        console.error('Error fetching pendaftaran:', error);
        toast.error('Gagal mengambil data pendaftaran');
      } finally {
        setLoading(false);
      }
    };

    fetchPendaftaran();
  }, []);

  // Calculate statistics
  const statistik = {
    totalPendaftaran: pendaftaran.length,
    diterima: pendaftaran.filter((p) => p.status === 'DITERIMA').length,
    ditolak: pendaftaran.filter((p) => p.status === 'DITOLAK').length,
    menunggu: pendaftaran.filter((p) => p.status === 'MENUNGGU_VERIFIKASI').length,
  };

  // Get active pendaftaran (most recent with status MENUNGGU_VERIFIKASI or DITERIMA)
  const pendaftaranAktif = pendaftaran
    .filter((p) => p.status === 'MENUNGGU_VERIFIKASI' || p.status === 'DITERIMA')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dashboard Mahasiswa
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Selamat datang di Portal Mahasiswa Siakad
          </p>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-muted-foreground">
                    Total Pendaftaran
                  </CardDescription>
                  <CardTitle className="text-3xl mt-2 text-primary">
                    {statistik.totalPendaftaran}
                  </CardTitle>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i className="fa-solid fa-file-pen text-primary text-xl"></i>
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-muted-foreground">
                    Diterima
                  </CardDescription>
                  <CardTitle className="text-3xl mt-2 text-green-600 dark:text-green-500">
                    {statistik.diterima}
                  </CardTitle>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-check-circle text-green-600 dark:text-green-500 text-xl"></i>
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-muted-foreground">
                    Menunggu Verifikasi
                  </CardDescription>
                  <CardTitle className="text-3xl mt-2 text-amber-600 dark:text-amber-500">
                    {statistik.menunggu}
                  </CardTitle>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-clock text-amber-600 dark:text-amber-500 text-xl"></i>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Pendaftaran Aktif */}
        <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/10 dark:border-blue-800/30">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-primary"></i>
                Pendaftaran Aktif
              </CardTitle>
              <CardDescription className="mt-1">
                Status pendaftaran semester antara terbaru
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 px-4">
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            ) : pendaftaranAktif ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">
                        {pendaftaranAktif.semester.nama}
                      </h3>
                      <Badge
                        variant={
                          pendaftaranAktif.status === 'DITERIMA'
                            ? 'default'
                            : pendaftaranAktif.status === 'DITOLAK'
                            ? 'destructive'
                            : 'secondary'
                        }>
                        {pendaftaranAktif.status === 'DITERIMA'
                          ? 'Diterima'
                          : pendaftaranAktif.status === 'DITOLAK'
                          ? 'Ditolak'
                          : pendaftaranAktif.status === 'MENUNGGU_VERIFIKASI'
                          ? 'Menunggu Verifikasi'
                          : pendaftaranAktif.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-book text-xs"></i>
                        {pendaftaranAktif.detail.length} Mata Kuliah
                      </span>
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-money-bill-wave text-xs"></i>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(pendaftaranAktif.totalBiaya)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <i className="fa-solid fa-calendar-days mr-1.5"></i>
                      Daftar:{' '}
                      {new Date(pendaftaranAktif.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={() => {
                      setSelectedPendaftaran(pendaftaranAktif);
                      setIsDetailModalOpen(true);
                    }}>
                    <i className="fa-solid fa-eye mr-2"></i>
                    Detail
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-calendar-plus text-primary text-xl"></i>
                </div>
                <CardTitle className="text-base mb-1">
                  Belum ada pendaftaran aktif
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Anda belum melakukan pendaftaran semester antara untuk periode
                  saat ini. Mulai pendaftaran baru untuk memilih mata kuliah.
                </p>
                <Link href="/mahasiswa/pendaftaran">
                  <Button>
                    <i className="fa-solid fa-plus mr-2"></i>
                    Daftar Semester Antara
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i className="fa-solid fa-file-pen text-primary"></i>
                </div>
                <CardTitle>Pendaftaran Baru</CardTitle>
              </div>
              <CardDescription>
                Daftar mata kuliah semester antara
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/mahasiswa/pendaftaran">
                <Button className="w-full">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Mulai Pendaftaran
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800/30 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-clock-rotate-left text-purple-600 dark:text-purple-400"></i>
                </div>
                <CardTitle>Riwayat Pendaftaran</CardTitle>
              </div>
              <CardDescription>Lihat semua pendaftaran Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/mahasiswa/riwayat">
                <Button
                  variant="outline"
                  className="w-full border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Lihat Riwayat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Detail Pendaftaran */}
      {selectedPendaftaran && (
        <DetailPendaftaranModal
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          data={{
            id: selectedPendaftaran.id,
            semester: selectedPendaftaran.semester.nama,
            tanggalDaftar: selectedPendaftaran.createdAt,
            status: selectedPendaftaran.status.toLowerCase(),
            totalMataKuliah: selectedPendaftaran.detail.length,
            totalSKS: selectedPendaftaran.totalSKS,
            totalBiaya: selectedPendaftaran.totalBiaya,
            paymentStatus: selectedPendaftaran.payment?.status.toLowerCase() || 'belum_bayar',
            paymentMethod: selectedPendaftaran.payment?.metodePembayaran || '',
            tanggalBayar: selectedPendaftaran.payment?.tanggalBayar || '',
            buktiPembayaran: selectedPendaftaran.payment?.buktiPembayaran || null,
            mataKuliah: selectedPendaftaran.detail.map((d) => ({
              kode: d.semesterMataKuliah.mataKuliah.kode,
              nama: d.semesterMataKuliah.mataKuliah.nama,
              sks: d.semesterMataKuliah.mataKuliah.sks,
              biaya: d.semesterMataKuliah.biaya,
            })),
            catatan: selectedPendaftaran.catatanAdmin,
          }}
        />
      )}
    </div>
  );
}
