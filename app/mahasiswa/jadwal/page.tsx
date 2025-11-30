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
  kode: string;
  nama: string;
  kelas: string;
  jadwal: string;
  dosen: string;
  sks: number;
  semester: {
    nama: string;
    tahun: string;
    periode: string;
  };
}

export default function JadwalKuliahPage() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/pendaftaran/user/me');
        if (!response.ok) throw new Error('Gagal mengambil data jadwal');
        const data = await response.json();

        // Filter hanya pendaftaran yang DITERIMA
        const diterimaPendaftaran = (data.pendaftaran || []).filter(
          (p: any) => p.status === 'DITERIMA'
        );

        // Extract jadwal dari semua pendaftaran yang diterima
        const allJadwal: JadwalItem[] = [];
        diterimaPendaftaran.forEach((pendaftaran: any) => {
          pendaftaran.detail.forEach((detail: any) => {
            allJadwal.push({
              id: detail.semesterMataKuliah.id,
              kode: detail.semesterMataKuliah.mataKuliah.kode,
              nama: detail.semesterMataKuliah.mataKuliah.nama,
              kelas: detail.semesterMataKuliah.kelas,
              jadwal: detail.semesterMataKuliah.jadwal,
              dosen: detail.semesterMataKuliah.dosen,
              sks: detail.semesterMataKuliah.mataKuliah.sks,
              semester: {
                nama: pendaftaran.semester.nama,
                tahun: pendaftaran.semester.tahun,
                periode: pendaftaran.semester.periode,
              },
            });
          });
        });

        setJadwal(allJadwal);
      } catch (error) {
        console.error('Error fetching jadwal:', error);
        toast.error('Gagal mengambil data jadwal');
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, []);

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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Jadwal Kuliah
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jadwal mata kuliah semester antara yang telah Anda daftarkan dan diterima
          </p>
        </div>

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
              <p className="text-muted-foreground mb-2">
                Belum ada jadwal kuliah
              </p>
              <p className="text-sm text-muted-foreground">
                Jadwal akan muncul setelah pendaftaran Anda diterima oleh admin
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
                      {items.length} mata kuliah - {items.reduce((sum, item) => sum + item.sks, 0)} SKS
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
                        <TableHead className="text-center">Kode</TableHead>
                        <TableHead className="text-center">Mata Kuliah</TableHead>
                        <TableHead className="text-center">Kelas</TableHead>
                        <TableHead className="text-center">Jadwal</TableHead>
                        <TableHead className="text-center">Dosen</TableHead>
                        <TableHead className="text-center">SKS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
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
                          <TableCell className="text-center">{item.dosen || '-'}</TableCell>
                          <TableCell className="text-center">{item.sks}</TableCell>
                        </TableRow>
                      ))}
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

