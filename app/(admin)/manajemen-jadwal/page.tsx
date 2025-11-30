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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface JadwalItem {
  id: string;
  pendaftaranDetailId: string;
  kode: string;
  nama: string;
  kelas: string;
  jadwal: string;
  tanggalJadwal?: string | Date | null;
  dosen: string;
  sks: number;
  statusJadwal: 'AKTIF' | 'SELESAI';
  mahasiswa: {
    nimOrNip: string;
    name: string;
  };
  semester: {
    nama: string;
    tahun: string;
    periode: string;
  };
}

interface JadwalStats {
  total: number;
  aktif: number;
  selesai: number;
}

export default function ManajemenJadwalPage() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [stats, setStats] = useState<JadwalStats>({
    total: 0,
    aktif: 0,
    selesai: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [semesters, setSemesters] = useState<Array<{ id: string; nama: string }>>([]);

  useEffect(() => {
    fetchSemesters();
    fetchJadwal();
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [statusFilter, semesterFilter]);

  const fetchSemesters = async () => {
    try {
      const response = await fetch('/api/semesters');
      if (!response.ok) throw new Error('Gagal mengambil data semester');
      const data = await response.json();
      setSemesters(data.semesters || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('statusJadwal', statusFilter);
      }
      if (semesterFilter !== 'all') {
        params.append('semesterId', semesterFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/jadwal?${params.toString()}`);
      if (!response.ok) throw new Error('Gagal mengambil data jadwal');
      const data = await response.json();

      setJadwal(data.jadwal || []);
      setStats(data.stats || { total: 0, aktif: 0, selesai: 0 });
    } catch (error) {
      console.error('Error fetching jadwal:', error);
      toast.error('Gagal mengambil data jadwal');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJadwal();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  // Group by semester
  const jadwalBySemester = jadwal.reduce((acc, item) => {
    const key = item.semester.nama;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, JadwalItem[]>);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Manajemen Jadwal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitoring dan melihat semua jadwal kuliah mahasiswa
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Jadwal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jadwal Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.aktif}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jadwal Selesai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.selesai}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cari</label>
                <Input
                  placeholder="Cari nama, NIM, atau mata kuliah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="SELESAI">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Semester</SelectItem>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jadwal Table */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Memuat data jadwal...</p>
            </CardContent>
          </Card>
        ) : Object.keys(jadwalBySemester).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-calendar-xmark text-2xl text-muted-foreground"></i>
              </div>
              <p className="text-muted-foreground mb-2">Tidak ada jadwal ditemukan</p>
              <p className="text-sm text-muted-foreground">
                Coba ubah filter atau pencarian Anda
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(jadwalBySemester).map(([semesterNama, items]) => (
            <Card key={semesterNama}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{semesterNama}</CardTitle>
                    <CardDescription>
                      {items.length} jadwal - {items.reduce((sum, item) => sum + item.sks, 0)} SKS
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {items[0].semester.tahun} - {items[0].semester.periode === 'GANJIL' ? 'Ganjil' : 'Genap'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Mahasiswa</TableHead>
                        <TableHead className="text-center">NIM</TableHead>
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
                      {items.map((item) => {
                        const isSelesai = item.statusJadwal === 'SELESAI';
                        return (
                          <TableRow
                            key={item.id}
                            className={isSelesai ? 'opacity-60 bg-muted/30' : ''}>
                            <TableCell className="text-center">
                              <Badge
                                variant={isSelesai ? 'default' : 'secondary'}
                                className={isSelesai ? 'bg-green-600' : ''}>
                                {item.statusJadwal}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{item.mahasiswa.name}</TableCell>
                            <TableCell className="text-center font-mono text-sm">
                              {item.mahasiswa.nimOrNip}
                            </TableCell>
                            <TableCell className="font-medium text-center">
                              {item.kode}
                            </TableCell>
                            <TableCell className="text-center">{item.nama}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{item.kelas}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-medium">{item.jadwal || '-'}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm text-muted-foreground">
                                {formatTanggal(item.tanggalJadwal)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">{item.dosen || '-'}</TableCell>
                            <TableCell className="text-center">{item.sks}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

