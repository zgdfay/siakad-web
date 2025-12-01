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
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface PendaftaranItem {
  id: string;
  semester: {
    nama: string;
    tahun: string;
    periode: string;
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
    };
  }>;
  payment?: {
    status: string;
    tanggalBayar?: string;
  } | null;
}

export default function UnduhanPage() {
  const [pendaftaran, setPendaftaran] = useState<PendaftaranItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendaftaran = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/pendaftaran/user/me');
        if (!response.ok) throw new Error('Gagal mengambil data pendaftaran');
        const data = await response.json();

        // Filter hanya pendaftaran yang DITERIMA
        // Jika status DITERIMA, payment otomatis menjadi LUNAS saat admin menerima
        const pendaftaranDiterima = (data.pendaftaran || []).filter(
          (p: any) =>
            p.status === 'DITERIMA' ||
            p.status?.toUpperCase() === 'DITERIMA'
        );

        setPendaftaran(pendaftaranDiterima);
      } catch (error) {
        console.error('Error fetching pendaftaran:', error);
        toast.error('Gagal mengambil data pendaftaran');
      } finally {
        setLoading(false);
      }
    };

    fetchPendaftaran();
  }, []);

  const handleDownloadSPK = (pendaftaranId: string) => {
    window.open(`/api/pendaftaran/${pendaftaranId}/spk`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Unduhan SPK
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Download Surat Perintah Kuliah (SPK) untuk pendaftaran yang telah diterima
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar SPK Tersedia</CardTitle>
            <CardDescription>
              {loading
                ? 'Memuat...'
                : `${pendaftaran.length} SPK tersedia untuk diunduh`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            ) : pendaftaran.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-file-pdf text-2xl text-muted-foreground"></i>
                </div>
                <p className="text-muted-foreground mb-2">
                  Belum ada SPK tersedia
                </p>
                <p className="text-sm text-muted-foreground">
                  SPK akan tersedia setelah pendaftaran Anda diterima dan pembayaran lunas
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">No</TableHead>
                      <TableHead className="text-center">Semester</TableHead>
                      <TableHead className="text-center">Mata Kuliah</TableHead>
                      <TableHead className="text-center">Total SKS</TableHead>
                      <TableHead className="text-center">Tanggal Diterima</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendaftaran.map((p, index) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="font-medium text-center">
                          <div>
                            <div>{p.semester.nama}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {p.semester.tahun} -{' '}
                              {p.semester.periode === 'GANJIL' ? 'Ganjil' : 'Genap'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            {p.detail.slice(0, 2).map((d, idx) => (
                              <div key={idx} className="text-sm">
                                {d.semesterMataKuliah.mataKuliah.kode} -{' '}
                                {d.semesterMataKuliah.mataKuliah.nama}
                              </div>
                            ))}
                            {p.detail.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{p.detail.length - 2} mata kuliah lainnya
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{p.totalSKS} SKS</TableCell>
                        <TableCell className="text-center">
                          {p.payment?.tanggalBayar
                            ? new Date(p.payment.tanggalBayar).toLocaleDateString(
                                'id-ID',
                                {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                }
                              )
                            : new Date(p.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              window.open(`/api/pendaftaran/${p.id}/spk`, '_blank');
                            }}
                            className="bg-green-600 hover:bg-green-700">
                            <i className="fa-solid fa-file-pdf mr-2"></i>
                            Download SPK
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-info-circle text-blue-600 dark:text-blue-400 text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                  Informasi SPK
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • SPK (Surat Perintah Kuliah) hanya tersedia untuk pendaftaran yang telah diterima
                  </li>
                  <li>
                    • SPK dapat diunduh setelah pembayaran lunas dan pendaftaran diverifikasi oleh admin
                  </li>
                  <li>
                    • SPK ini dapat digunakan untuk keperluan akademik dan administrasi
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

