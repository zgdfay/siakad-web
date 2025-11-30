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
    tanggalBayar?: string | null;
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
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
          Menunggu Verifikasi
        </Badge>
      );
    case 'dibatalkan':
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
          Dibatalkan
        </Badge>
      );
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
  if (!open || !data) return null;

  // Get tanggal pembayaran - prioritaskan dari payment.tanggalBayar, lalu data.tanggalBayar, atau jika diterima gunakan tanggal saat ini
  const getTanggalBayar = () => {
    if (data.payment?.tanggalBayar) {
      return data.payment.tanggalBayar;
    }
    if (data.tanggalBayar && data.tanggalBayar.trim() !== '') {
      return data.tanggalBayar;
    }
    // Jika status diterima tapi belum ada tanggalBayar, gunakan tanggal saat ini
    if (data.status === 'diterima') {
      return new Date().toISOString();
    }
    return null;
  };

  const tanggalBayar = getTanggalBayar();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-7xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background shadow-lg animate-in fade-in-0 zoom-in-95 flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10 bg-background/80 backdrop-blur-sm p-2"
          aria-label="Close">
          <i className="fa-solid fa-xmark text-lg"></i>
          <span className="sr-only">Close</span>
        </button>

        {/* Header - Fixed */}
        <div className="p-6 pb-4 pr-12 border-b shrink-0">
          <h2 className="text-2xl font-semibold">Detail Pendaftaran</h2>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {data.id.slice(0, 8)}...
          </p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 pr-12 min-h-0">
          <div className="space-y-4">
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{data.semester}</CardTitle>
                    <CardDescription>
                      Daftar:{' '}
                      {new Date(data.tanggalDaftar).toLocaleDateString(
                        'id-ID',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </CardDescription>
                  </div>
                  <div className="shrink-0">{getStatusBadge(data.status)}</div>
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
                        <TableHead className="text-center">
                          Nama Mata Kuliah
                        </TableHead>
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
                          <TableCell className="text-center">
                            {mk.nama}
                          </TableCell>
                          <TableCell className="text-center">
                            {mk.sks}
                          </TableCell>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">
                      Status Pembayaran
                    </span>
                    <div>
                      {/* Jika pendaftaran sudah diterima, otomatis lunas */}
                      {data.status === 'diterima' ||
                      data.paymentStatus === 'lunas' ||
                      data.paymentStatus === 'paid' ||
                      data.payment?.status?.toLowerCase() === 'lunas' ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                          Lunas
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                          Belum Lunas
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">
                      Metode Pembayaran
                    </span>
                    <div>
                      <span className="font-medium capitalize">
                        {data.paymentMethod || '-'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">
                      Tanggal Pembayaran
                    </span>
                    <div>
                      <span className="font-medium">
                        {tanggalBayar
                          ? (() => {
                              const date = new Date(tanggalBayar);
                              return isNaN(date.getTime())
                                ? tanggalBayar
                                : date.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  });
                            })()
                          : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">
                      Total Pembayaran
                    </span>
                    <div>
                      <span className="text-lg font-bold text-primary">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(data.totalBiaya)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bukti Pembayaran */}
                {data.buktiPembayaran && (
                  <div className="border-t pt-4 mt-4 space-y-2">
                    <Label className="text-sm font-medium">
                      Bukti Pembayaran
                    </Label>
                    <div className="border rounded-lg overflow-hidden">
                      {data.buktiPembayaran.endsWith('.pdf') ? (
                        <div className="p-4 bg-muted flex items-center justify-center">
                          <div className="text-center">
                            <i className="fa-solid fa-file-pdf text-4xl text-destructive mb-2"></i>
                            <p className="text-sm text-muted-foreground">
                              File PDF
                            </p>
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
                  <p className="text-sm text-muted-foreground">
                    {data.catatan}
                  </p>
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
                        <p className="font-semibold">Invoice Tersedia</p>
                        <p className="text-sm text-muted-foreground">
                          Download invoice pembayaran Anda di sini
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          // TODO: Implement invoice download endpoint
                          // For now, we can use SPK endpoint or create new invoice endpoint
                          window.open(
                            `/api/pendaftaran/${data.id}/invoice`,
                            '_blank'
                          );
                        }}>
                        <i className="fa-solid fa-file-invoice mr-2"></i>
                        Download Invoice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
    </>
  );
}
