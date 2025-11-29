'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DetailPendaftaranModal } from '@/components/pendaftaran/detail-pendaftaran-modal';

// Mock data - akan diganti dengan data dari API
const mockRiwayat = [
  {
    id: '1',
    semester: 'Semester Antara 2025',
    tanggalDaftar: '2025-01-15',
    status: 'menunggu_verifikasi',
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
  },
  {
    id: '2',
    semester: 'Semester Antara 2024',
    tanggalDaftar: '2024-07-10',
    status: 'diterima',
    totalMataKuliah: 2,
    totalSKS: 6,
    totalBiaya: 1000000,
    paymentStatus: 'paid',
    paymentMethod: 'xendit',
    tanggalBayar: '2024-07-10',
    mataKuliah: [
      { kode: 'MK004', nama: 'Algoritma dan Struktur Data', sks: 3, biaya: 500000 },
      { kode: 'MK005', nama: 'Sistem Operasi', sks: 3, biaya: 500000 },
    ],
    catatan: null,
  },
  {
    id: '3',
    semester: 'Semester Antara 2024',
    tanggalDaftar: '2024-06-20',
    status: 'ditolak',
    totalMataKuliah: 4,
    totalSKS: 12,
    totalBiaya: 2000000,
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    tanggalBayar: '2024-06-20',
    mataKuliah: [
      { kode: 'MK006', nama: 'Pemrograman Mobile', sks: 3, biaya: 500000 },
      { kode: 'MK007', nama: 'Cloud Computing', sks: 3, biaya: 500000 },
      { kode: 'MK008', nama: 'Machine Learning', sks: 3, biaya: 500000 },
      { kode: 'MK009', nama: 'Blockchain', sks: 3, biaya: 500000 },
    ],
    catatan: 'Pendaftaran ditolak karena tidak memenuhi syarat minimum IPK',
  },
];

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
  const [selectedDetail, setSelectedDetail] = useState<typeof mockRiwayat[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDetailClick = (riwayat: typeof mockRiwayat[0]) => {
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
              {mockRiwayat.length} pendaftaran ditemukan
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
                  {mockRiwayat.map((riwayat) => (
                    <TableRow key={riwayat.id}>
                      <TableCell className="font-medium text-center">
                        {riwayat.semester}
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(riwayat.tanggalDaftar).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-center">
                        {riwayat.totalMataKuliah} MK - {riwayat.totalSKS} SKS
                      </TableCell>
                      <TableCell className="text-center">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(riwayat.totalBiaya)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(riwayat.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDetailClick(riwayat)}>
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Detail Pendaftaran */}
      <DetailPendaftaranModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={selectedDetail}
      />
    </div>
  );
}

