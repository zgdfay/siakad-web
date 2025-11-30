'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

interface MataKuliah {
  kode: string;
  nama: string;
  sks: number;
}

interface RingkasanPendaftaran {
  id: string;
  semester: {
    nama: string;
    tahun: string;
    periode: string;
  };
  tanggalDaftar: string;
  status: string;
  totalMataKuliah: number;
  totalSKS: number;
  totalBiaya: number;
  paymentStatus: string;
  tanggalBayar?: string | null;
  mataKuliah: MataKuliah[];
}

interface RingkasanPendaftaranModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RingkasanPendaftaran | null;
}

export function RingkasanPendaftaranModal({
  open,
  onOpenChange,
  data,
}: RingkasanPendaftaranModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ringkasan Pendaftaran</DialogTitle>
          <DialogDescription>
            Detail lengkap pendaftaran semester antara Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Success Header */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                  <i className="fa-solid fa-check-circle text-green-600 dark:text-green-400 text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400">
                    Pendaftaran Diterima!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
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
                  <CardTitle className="text-lg">{data.semester.nama}</CardTitle>
                  <CardDescription>
                    {data.semester.tahun} - {data.semester.periode === 'GANJIL' ? 'Ganjil' : 'Genap'}
                  </CardDescription>
                </div>
                <Badge className="bg-green-600">Diterima</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Mata Kuliah */}
          <Card>
            <CardHeader>
              <CardTitle>Mata Kuliah yang Diterima</CardTitle>
              <CardDescription>
                {data.totalMataKuliah} mata kuliah - {data.totalSKS} SKS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Kode</TableHead>
                      <TableHead className="text-center">Mata Kuliah</TableHead>
                      <TableHead className="text-center">SKS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.mataKuliah.map((mk, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-center">
                          {mk.kode}
                        </TableCell>
                        <TableCell className="text-center">{mk.nama}</TableCell>
                        <TableCell className="text-center">{mk.sks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <p className="font-semibold text-lg">{data.totalSKS} SKS</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Total Biaya</span>
                  <p className="font-semibold text-lg text-primary">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(data.totalBiaya)}
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
                    {data.tanggalBayar
                      ? new Date(data.tanggalBayar).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : new Date(data.tanggalDaftar).toLocaleDateString('id-ID', {
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
                <CardTitle className="flex items-center gap-2 text-base">
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
                    window.open(`/api/pendaftaran/${data.id}/spk`, '_blank');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700">
                  <i className="fa-solid fa-download mr-2"></i>
                  Download SPK
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

