'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { RingkasanPendaftaranModal } from '@/components/pendaftaran/ringkasan-pendaftaran-modal';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';

interface PendaftaranItem {
  id: string;
  semester: {
    nama: string;
    tahun: string;
    periode: string;
  };
  createdAt: string;
  updatedAt?: string;
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
  const router = useRouter();
  const [pendaftaran, setPendaftaran] = useState<PendaftaranItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRingkasanModalOpen, setIsRingkasanModalOpen] = useState(false);
  const [selectedPendaftaran, setSelectedPendaftaran] =
    useState<PendaftaranItem | null>(null);
  const [selectedRingkasan, setSelectedRingkasan] =
    useState<PendaftaranItem | null>(null);

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
    menunggu: pendaftaran.filter((p) => p.status === 'MENUNGGU_VERIFIKASI')
      .length,
  };

  // Get active pendaftaran (most recent with status MENUNGGU_VERIFIKASI or DITERIMA)
  const pendaftaranAktif = pendaftaran
    .filter(
      (p) => p.status === 'MENUNGGU_VERIFIKASI' || p.status === 'DITERIMA'
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  // Get all accepted pendaftaran, sorted by date (newest first), limit to 2
  const pendaftaranDiterima = pendaftaran
    .filter((p) => p.status === 'DITERIMA')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 2);

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <i className="fa-solid fa-calendar-check text-primary"></i>
                  Pendaftaran Aktif
                </CardTitle>
                <CardDescription className="mt-1">
                  Status pendaftaran semester antara terbaru
                  {pendaftaranDiterima.length > 0 && (
                    <span className="ml-2">
                      • {pendaftaranDiterima.length} pendaftaran diterima
                    </span>
                  )}
                </CardDescription>
              </div>
              {pendaftaranDiterima.length > 0 && (
                <Badge className="bg-green-600">
                  {pendaftaranDiterima.length} Diterima
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 px-4">
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            ) : pendaftaranAktif ? (
              <div className="space-y-4">
                {/* List Pendaftaran Diterima (max 2) */}
                {pendaftaranDiterima.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-semibold text-foreground px-1 mb-2">
                      Pendaftaran Diterima ({pendaftaranDiterima.length})
                    </h4>
                    {pendaftaranDiterima.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-white dark:bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {p.semester.nama}
                            </span>
                            <Badge className="bg-green-600 text-xs">
                              Diterima
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRingkasan(p);
                              setIsRingkasanModalOpen(true);
                            }}
                            className="bg-green-600 hover:bg-green-700">
                            <i className="fa-solid fa-check-circle mr-2"></i>
                            Ringkasan
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Mata Kuliah:
                          </div>
                          <div className="space-y-1">
                            {p.detail.map((detail, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="font-medium text-foreground">
                                    {detail.semesterMataKuliah.mataKuliah.kode}
                                  </span>

                                  <span className="text-muted-foreground">
                                    {detail.semesterMataKuliah.mataKuliah.nama}
                                  </span>
                                  <span className="text-muted-foreground">
                                    Total: {p.totalSKS} SKS
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
              <Link href={ROUTES.MAHASISWA.PENDAFTARAN}>
                <Button className="w-full">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Mulai Pendaftaran
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-calendar-days text-blue-600 dark:text-blue-400"></i>
                </div>
                <CardTitle>Jadwal Kuliah</CardTitle>
              </div>
              <CardDescription>Lihat jadwal kuliah Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={ROUTES.MAHASISWA.JADWAL}>
                <Button
                  variant="outline"
                  className="w-full border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Lihat Jadwal
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800/30 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-file-pdf text-green-600 dark:text-green-400"></i>
                </div>
                <CardTitle>Unduhan SPK</CardTitle>
              </div>
              <CardDescription>Download SPK pendaftaran Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={ROUTES.MAHASISWA.UNDUHAN}>
                <Button
                  variant="outline"
                  className="w-full border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/20">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Lihat Unduhan
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
              <Link href={ROUTES.MAHASISWA.RIWAYAT}>
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
            paymentStatus:
              selectedPendaftaran.payment?.status.toLowerCase() ||
              'belum_bayar',
            paymentMethod: selectedPendaftaran.payment?.metodePembayaran || '',
            tanggalBayar: selectedPendaftaran.payment?.tanggalBayar || '',
            payment: selectedPendaftaran.payment
              ? {
                  status: selectedPendaftaran.payment.status,
                  tanggalBayar:
                    selectedPendaftaran.payment.tanggalBayar || null,
                }
              : undefined,
            buktiPembayaran:
              selectedPendaftaran.payment &&
              'buktiPembayaran' in selectedPendaftaran.payment
                ? (selectedPendaftaran.payment as any).buktiPembayaran || null
                : null,
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

      {/* Modal Ringkasan Pendaftaran */}
      {selectedRingkasan && (
        <RingkasanPendaftaranModal
          open={isRingkasanModalOpen}
          onOpenChange={setIsRingkasanModalOpen}
          data={{
            id: selectedRingkasan.id,
            semester: {
              nama: selectedRingkasan.semester.nama,
              tahun: selectedRingkasan.semester.tahun,
              periode: selectedRingkasan.semester.periode,
            },
            tanggalDaftar: selectedRingkasan.createdAt,
            status: selectedRingkasan.status.toLowerCase(),
            totalMataKuliah: selectedRingkasan.detail.length,
            totalSKS: selectedRingkasan.totalSKS,
            totalBiaya: selectedRingkasan.totalBiaya,
            paymentStatus:
              selectedRingkasan.payment?.status.toLowerCase() || 'belum_bayar',
            tanggalBayar: selectedRingkasan.payment?.tanggalBayar || null,
            mataKuliah: selectedRingkasan.detail.map((d) => ({
              kode: d.semesterMataKuliah.mataKuliah.kode,
              nama: d.semesterMataKuliah.mataKuliah.nama,
              sks: d.semesterMataKuliah.mataKuliah.sks,
            })),
          }}
        />
      )}
    </div>
  );
}
