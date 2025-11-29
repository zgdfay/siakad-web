'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DetailPendaftaranModal } from '@/components/pendaftaran/detail-pendaftaran-modal';
import { toast } from 'sonner';

interface RiwayatItem {
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

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState<RiwayatItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/pendaftaran/user/me');
        if (!response.ok) throw new Error('Gagal mengambil data riwayat');
        const data = await response.json();
        setRiwayat(data.pendaftaran || []);
      } catch (error) {
        console.error('Error fetching riwayat:', error);
        toast.error('Gagal mengambil data riwayat');
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
  }, []);

  const handleDetailClick = (riwayat: RiwayatItem) => {
    setSelectedDetail(riwayat);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Riwayat Pendaftaran
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lihat semua pendaftaran semester antara Anda
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pendaftaran</CardTitle>
            <CardDescription>
              {loading ? 'Memuat...' : `${riwayat.length} pendaftaran ditemukan`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Semester</TableHead>
                    <TableHead className="text-center">Tanggal Daftar</TableHead>
                    <TableHead className="text-center">Mata Kuliah</TableHead>
                    <TableHead className="text-center">Total Biaya</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : riwayat.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Belum ada riwayat pendaftaran
                      </TableCell>
                    </TableRow>
                  ) : (
                    riwayat.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-center">
                          {r.semester.nama}
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(r.createdAt).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.detail.length} MK - {r.totalSKS} SKS
                        </TableCell>
                        <TableCell className="text-center">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          }).format(r.totalBiaya)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(r.status.toLowerCase())}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDetailClick(r)}>
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Detail Pendaftaran */}
      {selectedDetail && (
        <DetailPendaftaranModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          data={{
            id: selectedDetail.id,
            semester: selectedDetail.semester.nama,
            tanggalDaftar: selectedDetail.createdAt,
            status: selectedDetail.status.toLowerCase(),
            totalMataKuliah: selectedDetail.detail.length,
            totalSKS: selectedDetail.totalSKS,
            totalBiaya: selectedDetail.totalBiaya,
            paymentStatus: selectedDetail.payment?.status.toLowerCase() || 'belum_bayar',
            paymentMethod: selectedDetail.payment?.metodePembayaran || '',
            tanggalBayar: selectedDetail.payment?.tanggalBayar || '',
            buktiPembayaran: selectedDetail.payment?.buktiPembayaran || null,
            mataKuliah: selectedDetail.detail.map((d) => ({
              kode: d.semesterMataKuliah.mataKuliah.kode,
              nama: d.semesterMataKuliah.mataKuliah.nama,
              sks: d.semesterMataKuliah.mataKuliah.sks,
              biaya: d.semesterMataKuliah.biaya,
            })),
            catatan: selectedDetail.catatanAdmin,
          }}
        />
      )}
    </div>
  );
}

