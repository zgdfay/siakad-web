'use client';

import { useState } from 'react';
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
import { cn } from '@/lib/utils';

// Mock data - akan diganti dengan data dari API
const mockPendaftaranAktif = {
  id: '1',
  semester: 'Semester Antara 2025',
  status: 'menunggu_verifikasi',
  tanggalDaftar: '2025-01-15',
  totalMataKuliah: 3,
  totalSKS: 9,
  totalBiaya: 1500000,
  paymentStatus: 'paid',
  paymentMethod: 'midtrans',
  tanggalBayar: '2025-01-15',
  mataKuliah: [
    { kode: 'MK001', nama: 'Pemrograman Web', sks: 3, biaya: 500000 },
    { kode: 'MK002', nama: 'Basis Data', sks: 3, biaya: 500000 },
    { kode: 'MK003', nama: 'Jaringan Komputer', sks: 3, biaya: 500000 },
  ],
  catatan: null,
};

const mockStatistik = {
  totalPendaftaran: 5,
  diterima: 3,
  ditolak: 1,
  menunggu: 1,
};

export default function MahasiswaDashboard() {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
                    {mockStatistik.totalPendaftaran}
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
                    {mockStatistik.diterima}
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
                    {mockStatistik.menunggu}
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
            {mockPendaftaranAktif ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">
                        {mockPendaftaranAktif.semester}
                      </h3>
                      <Badge
                        variant={
                          mockPendaftaranAktif.status === 'diterima'
                            ? 'default'
                            : mockPendaftaranAktif.status === 'ditolak'
                            ? 'destructive'
                            : 'secondary'
                        }>
                        {mockPendaftaranAktif.status === 'diterima'
                          ? 'Diterima'
                          : mockPendaftaranAktif.status === 'ditolak'
                          ? 'Ditolak'
                          : mockPendaftaranAktif.status ===
                            'menunggu_verifikasi'
                          ? 'Menunggu Verifikasi'
                          : mockPendaftaranAktif.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-book text-xs"></i>
                        {mockPendaftaranAktif.totalMataKuliah} Mata Kuliah
                      </span>
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-money-bill-wave text-xs"></i>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(mockPendaftaranAktif.totalBiaya)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <i className="fa-solid fa-calendar-days mr-1.5"></i>
                      Daftar:{' '}
                      {new Date(
                        mockPendaftaranAktif.tanggalDaftar
                      ).toLocaleDateString('id-ID', {
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
                    onClick={() => setIsDetailModalOpen(true)}>
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
      <DetailPendaftaranModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        data={mockPendaftaranAktif}
      />
    </div>
  );
}
