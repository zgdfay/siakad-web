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
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Mock data - akan diganti dengan data dari API
const mockPendaftaran = [
  {
    id: '1',
    nim: '2021001',
    nama: 'Ahmad Fauzi',
    semester: 'Semester Antara 2025',
    tanggalDaftar: '2025-01-15',
    status: 'menunggu_verifikasi',
    totalMataKuliah: 3,
    totalSKS: 9,
    totalBiaya: 1500000,
    paymentStatus: 'paid',
  },
  {
    id: '2',
    nim: '2021002',
    nama: 'Siti Nurhaliza',
    semester: 'Semester Antara 2025',
    tanggalDaftar: '2025-01-14',
    status: 'menunggu_verifikasi',
    totalMataKuliah: 2,
    totalSKS: 6,
    totalBiaya: 1000000,
    paymentStatus: 'paid',
  },
  {
    id: '3',
    nim: '2021003',
    nama: 'Budi Santoso',
    semester: 'Semester Antara 2025',
    tanggalDaftar: '2025-01-13',
    status: 'diterima',
    totalMataKuliah: 4,
    totalSKS: 12,
    totalBiaya: 2000000,
    paymentStatus: 'paid',
  },
];

export default function AdminPendaftaranPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPendaftaran, setSelectedPendaftaran] = useState<string | null>(
    null
  );
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'diterima' | 'ditolak'
  >('diterima');
  const [catatan, setCatatan] = useState('');

  const filteredPendaftaran = mockPendaftaran.filter((p) => {
    const matchesSearch =
      p.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVerifikasi = async () => {
    if (!selectedPendaftaran) return;

    try {
      // TODO: Update status di database
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Verifikasi berhasil', {
        description: `Pendaftaran ${
          verificationStatus === 'diterima' ? 'diterima' : 'ditolak'
        }`,
      });

      setVerificationDialog(false);
      setSelectedPendaftaran(null);
      setCatatan('');
    } catch (error) {
      toast.error('Gagal memverifikasi', {
        description: 'Terjadi kesalahan saat memverifikasi',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'diterima':
        return <Badge className="bg-green-600">Diterima</Badge>;
      case 'ditolak':
        return <Badge variant="destructive">Ditolak</Badge>;
      case 'menunggu_verifikasi':
        return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manajemen Pendaftaran
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verifikasi dan kelola pendaftaran semester antara
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari</Label>
              <Input
                id="search"
                placeholder="Cari berdasarkan NIM atau nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Filter Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="menunggu_verifikasi">
                    Menunggu Verifikasi
                  </SelectItem>
                  <SelectItem value="diterima">Diterima</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pendaftaran</CardTitle>
          <CardDescription>
            {filteredPendaftaran.length} pendaftaran ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead className="text-right">Total Biaya</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPendaftaran.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nim}</TableCell>
                  <TableCell>{p.nama}</TableCell>
                  <TableCell>{p.semester}</TableCell>
                  <TableCell>
                    {new Date(p.tanggalDaftar).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>
                    {p.totalMataKuliah} MK - {p.totalSKS} SKS
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(p.totalBiaya)}
                  </TableCell>
                  <TableCell>{getStatusBadge(p.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Lihat detail
                        }}>
                        Detail
                      </Button>
                      {p.status === 'menunggu_verifikasi' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPendaftaran(p.id);
                            setVerificationDialog(true);
                          }}>
                          Verifikasi
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={verificationDialog} onOpenChange={setVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verifikasi Pendaftaran</DialogTitle>
            <DialogDescription>
              Pilih status verifikasi untuk pendaftaran ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status Verifikasi</Label>
              <Select
                value={verificationStatus}
                onValueChange={(value: 'diterima' | 'ditolak') =>
                  setVerificationStatus(value)
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diterima">Diterima</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan (Opsional)</Label>
              <textarea
                id="catatan"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                placeholder="Tambahkan catatan jika diperlukan..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVerificationDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleVerifikasi}>
              {verificationStatus === 'diterima' ? 'Terima' : 'Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
