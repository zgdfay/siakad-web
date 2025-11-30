'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendaftaranId = searchParams.get('pendaftaranId');
  const [pendaftaran, setPendaftaran] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pendaftaranId) {
      router.push(ROUTES.MAHASISWA.RIWAYAT);
      return;
    }

    const fetchPendaftaran = async () => {
      try {
        const response = await fetch(`/api/pendaftaran/${pendaftaranId}`);
        if (!response.ok) throw new Error('Gagal mengambil data pendaftaran');
        const data = await response.json();
        setPendaftaran(data.pendaftaran);
      } catch (error) {
        console.error('Error fetching pendaftaran:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendaftaran();
  }, [pendaftaranId, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!pendaftaran) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Data pendaftaran tidak ditemukan</p>
          <Button onClick={() => router.push(ROUTES.MAHASISWA.RIWAYAT)} className="mt-4">
            Kembali ke Riwayat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <i className="fa-solid fa-check-circle text-green-600 dark:text-green-400 text-3xl"></i>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400">
                  Bukti Pembayaran Berhasil Diupload!
                </h1>
                <p className="text-muted-foreground mt-2">
                  Pendaftaran Anda sedang menunggu verifikasi dari admin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pendaftaran Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pendaftaran</CardTitle>
            <CardDescription>
              ID Pendaftaran: {pendaftaran.id.slice(0, 8)}...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Semester</span>
                <p className="font-medium">{pendaftaran.semester.nama}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="mt-1">
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                    Menunggu Verifikasi
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total Mata Kuliah</span>
                <p className="font-medium">{pendaftaran.detail.length} Mata Kuliah</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total SKS</span>
                <p className="font-medium">{pendaftaran.totalSKS} SKS</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total Biaya</span>
                <p className="font-medium text-lg">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(pendaftaran.totalBiaya)}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Tanggal Daftar</span>
                <p className="font-medium">
                  {new Date(pendaftaran.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Langkah Selanjutnya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Tunggu Verifikasi Admin</p>
                <p className="text-sm text-muted-foreground">
                  Admin akan memverifikasi pendaftaran dan bukti pembayaran Anda dalam 1-3 hari kerja
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Cek Status Pendaftaran</p>
                <p className="text-sm text-muted-foreground">
                  Anda dapat mengecek status pendaftaran kapan saja di halaman Riwayat Pendaftaran
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Download SPK</p>
                <p className="text-sm text-muted-foreground">
                  Setelah pendaftaran diterima, Anda dapat mengunduh SPK (Surat Perintah Kuliah) di halaman detail pendaftaran
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => router.push(ROUTES.MAHASISWA.RIWAYAT)}
            className="flex-1">
            <i className="fa-solid fa-clock-rotate-left mr-2"></i>
            Lihat Riwayat Pendaftaran
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.MAHASISWA.DASHBOARD)}
            className="flex-1">
            <i className="fa-solid fa-home mr-2"></i>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

