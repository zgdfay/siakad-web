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
import { Label } from '@/components/ui/label';

interface MataKuliah {
  kode: string;
  nama: string;
  sks: number;
  biaya: number;
}

interface DetailPendaftaran {
  id: string;
  semester: string;
  tanggalDaftar: string;
  status: string;
  totalMataKuliah: number;
  totalSKS: number;
  totalBiaya: number;
  paymentStatus: string;
  paymentMethod: string;
  tanggalBayar?: string | null;
  buktiPembayaran?: string | null;
  payment?: {
    status: string;
  };
  mataKuliah: MataKuliah[];
  catatan?: string | null;
}

interface DetailPendaftaranModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DetailPendaftaran | null;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'diterima':
      return <Badge className="bg-green-600">Diterima</Badge>;
    case 'ditolak':
      return <Badge variant="destructive">Ditolak</Badge>;
    case 'menunggu_verifikasi':
      return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
    case 'pending_payment':
      return <Badge variant="outline">Menunggu Pembayaran</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function DetailPendaftaranModal({
  open,
  onOpenChange,
  data,
}: DetailPendaftaranModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pendaftaran</DialogTitle>
          <DialogDescription>ID Pendaftaran: {data.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{data.semester}</CardTitle>
                  <CardDescription>
                    Daftar:{' '}
                    {new Date(data.tanggalDaftar).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </CardDescription>
                </div>
                {getStatusBadge(data.status)}
              </div>
            </CardHeader>
          </Card>

          {/* Mata Kuliah */}
          <Card>
            <CardHeader>
              <CardTitle>Mata Kuliah yang Didaftarkan</CardTitle>
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
                      <TableHead className="text-center">Nama Mata Kuliah</TableHead>
                      <TableHead className="text-center">SKS</TableHead>
                      <TableHead className="text-center">Biaya</TableHead>
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
                        <TableCell className="text-center">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          }).format(mk.biaya)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pembayaran */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Pembayaran</span>
                <Badge
                  variant={
                    data.paymentStatus === 'paid' ? 'default' : 'outline'
                  }>
                  {data.paymentStatus === 'paid' ? 'Lunas' : 'Belum Lunas'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode Pembayaran</span>
                <span className="font-medium capitalize">
                  {data.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Pembayaran</span>
                <span className="font-medium">
                  {data.tanggalBayar && data.tanggalBayar.trim() !== ''
                    ? (() => {
                        const date = new Date(data.tanggalBayar);
                        return isNaN(date.getTime())
                          ? data.tanggalBayar
                          : date.toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            });
                      })()
                    : '-'}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Pembayaran</span>
                  <span className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(data.totalBiaya)}
                  </span>
                </div>
              </div>

              {/* Bukti Pembayaran */}
              {data.buktiPembayaran && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <Label className="text-sm font-medium">Bukti Pembayaran</Label>
                  <div className="border rounded-lg overflow-hidden">
                    {data.buktiPembayaran.endsWith('.pdf') ? (
                      <div className="p-4 bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <i className="fa-solid fa-file-pdf text-4xl text-destructive mb-2"></i>
                          <p className="text-sm text-muted-foreground">File PDF</p>
                          <a
                            href={data.buktiPembayaran}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-2 inline-block">
                            <i className="fa-solid fa-external-link mr-1"></i>
                            Buka PDF
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={data.buktiPembayaran}
                          alt="Bukti pembayaran"
                          className="w-full h-auto max-h-96 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                          }}
                        />
                        <a
                          href={data.buktiPembayaran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-md text-sm inline-flex items-center gap-1 transition-colors">
                          <i className="fa-solid fa-expand"></i>
                          Buka
                        </a>
                      </div>
                    )}
                  </div>
                  <a
                    href={data.buktiPembayaran}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                    <i className="fa-solid fa-external-link"></i>
                    Buka di tab baru
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Catatan */}
          {data.catatan && (
            <Card>
              <CardHeader>
                <CardTitle>Catatan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{data.catatan}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {data.status === 'diterima' &&
            (data.payment?.status?.toLowerCase() === 'lunas' ||
              data.paymentStatus === 'lunas') && (
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">SPK Tersedia</p>
                      <p className="text-sm text-muted-foreground">
                        Download SPK Anda di sini
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        window.open(`/api/pendaftaran/${data.id}/spk`, '_blank');
                      }}>
                      <i className="fa-solid fa-download mr-2"></i>
                      Download SPK
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

