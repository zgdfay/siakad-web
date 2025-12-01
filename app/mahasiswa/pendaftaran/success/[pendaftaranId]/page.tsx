'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

export default function PendaftaranDiterimaPage() {
  const router = useRouter();
  const params = useParams();
  const pendaftaranId = params.pendaftaranId as string;
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
        
        // Only show if status is DITERIMA
        if (data.pendaftaran.status !== 'DITERIMA') {
          router.push(ROUTES.MAHASISWA.RIWAYAT);
          return;
        }
        
        setPendaftaran(data.pendaftaran);
      } catch (error) {
        console.error('Error fetching pendaftaran:', error);
        router.push(ROUTES.MAHASISWA.RIWAYAT);
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
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <i className="fa-solid fa-check-circle text-green-600 dark:text-green-400 text-4xl"></i>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-green-700 dark:text-green-400">
                  Selamat! Pendaftaran Anda Diterima
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Anda telah terdaftar untuk mengikuti perkuliahan semester antara
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Semester Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{pendaftaran.semester.nama}</CardTitle>
                <CardDescription>
                  {pendaftaran.semester.tahun} - {pendaftaran.semester.periode === 'GANJIL' ? 'Ganjil' : 'Genap'}
                </CardDescription>
              </div>
              <Badge className="bg-green-600">Diterima</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Mata Kuliah yang Diterima */}
        <Card>
          <CardHeader>
            <CardTitle>Mata Kuliah yang Diterima</CardTitle>
            <CardDescription>
              {pendaftaran.detail.length} mata kuliah - {pendaftaran.totalSKS} SKS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Kode</TableHead>
                    <TableHead className="text-center">Mata Kuliah</TableHead>
                    <TableHead className="text-center">Kelas</TableHead>
                    <TableHead className="text-center">Jadwal</TableHead>
                    <TableHead className="text-center">Tanggal</TableHead>
                    <TableHead className="text-center">Dosen</TableHead>
                    <TableHead className="text-center">SKS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendaftaran.detail.map((detail: any, index: number) => {
                    const formatTanggal = (tanggal: string | Date | null | undefined) => {
                      if (!tanggal) return '-';
                      try {
                        const date = new Date(tanggal);
                        return date.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch {
                        return '-';
                      }
                    };

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-center">
                          {detail.semesterMataKuliah.mataKuliah.kode}
                        </TableCell>
                        <TableCell className="text-center">
                          {detail.semesterMataKuliah.mataKuliah.nama}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{detail.semesterMataKuliah.kelas}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">
                            {detail.semesterMataKuliah.jadwal || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-muted-foreground">
                            {formatTanggal(detail.semesterMataKuliah.tanggalJadwal)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {detail.semesterMataKuliah.dosen || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {detail.semesterMataKuliah.mataKuliah.sks}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Penting */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Penting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Total SKS</span>
                <p className="font-semibold text-lg">{pendaftaran.totalSKS} SKS</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Total Biaya</span>
                <p className="font-semibold text-lg text-primary">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(pendaftaran.totalBiaya)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Status Pembayaran</span>
                <div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                    Lunas
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Tanggal Verifikasi</span>
                <p className="font-medium">
                  {new Date(pendaftaran.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fa-solid fa-file-pdf text-blue-600"></i>
                Download SPK
              </CardTitle>
              <CardDescription>
                Surat Perintah Kuliah untuk keperluan akademik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  window.open(`/api/pendaftaran/${pendaftaranId}/spk`, '_blank');
                }}
                className="w-full">
                <i className="fa-solid fa-download mr-2"></i>
                Download SPK
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fa-solid fa-calendar-days text-purple-600"></i>
                Lihat Jadwal
              </CardTitle>
              <CardDescription>
                Lihat jadwal kuliah lengkap Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={ROUTES.MAHASISWA.JADWAL}>
                <Button variant="outline" className="w-full">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Lihat Jadwal Kuliah
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => router.push(ROUTES.MAHASISWA.RIWAYAT)}
            variant="outline"
            className="flex-1">
            <i className="fa-solid fa-clock-rotate-left mr-2"></i>
            Lihat Riwayat Pendaftaran
          </Button>
          <Button
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

