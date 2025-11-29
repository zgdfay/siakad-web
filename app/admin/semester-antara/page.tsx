 'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SemesterAntara {
  id: string;
  nama: string;
  tahun: string;
  periode: 'Ganjil' | 'Genap' | 'Antara';
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'aktif' | 'nonaktif';
}

// Mock data - akan diganti dengan data dari API
const initialSemesterList: SemesterAntara[] = [
  {
    id: '1',
    nama: 'Semester Antara 2025 - Ganjil',
    tahun: '2025',
    periode: 'Ganjil',
    tanggalMulai: '2025-07-01',
    tanggalSelesai: '2025-08-31',
    status: 'aktif',
  },
  {
    id: '2',
    nama: 'Semester Antara 2025 - Genap',
    tahun: '2025',
    periode: 'Genap',
    tanggalMulai: '2025-12-01',
    tanggalSelesai: '2026-01-31',
    status: 'nonaktif',
  },
  {
    id: '3',
    nama: 'Semester Antara 2024 - Ganjil',
    tahun: '2024',
    periode: 'Ganjil',
    tanggalMulai: '2024-07-01',
    tanggalSelesai: '2024-08-31',
    status: 'nonaktif',
  },
];

type PeriodeFilter = 'Semua' | 'Ganjil' | 'Genap';

export default function SemesterAntaraPage() {
  const [semesterList, setSemesterList] =
    useState<SemesterAntara[]>(initialSemesterList);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodeAktif, setPeriodeAktif] = useState<PeriodeFilter>('Ganjil');

  const handleSetPeriodeAktif = (periode: PeriodeFilter) => {
    setPeriodeAktif(periode);

    // TODO: Sinkronkan dengan API agar status semester tersimpan di server
    setSemesterList((prev) =>
      prev.map((sem) => {
        if (periode === 'Semua') {
          return { ...sem, status: 'aktif' };
        }
        if (sem.periode === periode) {
          return { ...sem, status: 'aktif' };
        }
        if (sem.periode === 'Ganjil' || sem.periode === 'Genap') {
          return { ...sem, status: 'nonaktif' };
        }
        return sem;
      })
    );
  };

  const filteredSemester = semesterList.filter(
    (semester) =>
      semester.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      semester.tahun.includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Manajemen Semester Antara
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola data semester antara dan periode aktif untuk mahasiswa
          </p>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Periode aktif:
            </span>
            <div className="inline-flex rounded-md border bg-background p-0.5">
              <Button
                type="button"
                variant={periodeAktif === 'Ganjil' ? 'default' : 'ghost'}
                size="sm"
                className="px-3"
                onClick={() => handleSetPeriodeAktif('Ganjil')}>
                Ganjil
              </Button>
              <Button
                type="button"
                variant={periodeAktif === 'Genap' ? 'default' : 'ghost'}
                size="sm"
                className="px-3"
                onClick={() => handleSetPeriodeAktif('Genap')}>
                Genap
              </Button>
              <Button
                type="button"
                variant={periodeAktif === 'Semua' ? 'default' : 'ghost'}
                size="sm"
                className="px-3 hidden sm:inline-flex"
                onClick={() => handleSetPeriodeAktif('Semua')}>
                Semua
              </Button>
            </div>
          </div>
          <Link href="/admin/semester-antara/tambah">
            <Button size="sm" className="w-full sm:w-auto">
              <i className="fa-solid fa-plus mr-2"></i>
              Tambah Semester Antara
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Semester Antara</CardTitle>
          <CardDescription>
            Cari dan kelola semester antara yang tersedia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Cari berdasarkan nama semester atau tahun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 max-w-md"
          />

          <div className="rounded-md border border-border overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Nama Semester
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Tahun
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Periode
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Tanggal
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSemester.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground text-sm">
                      <p className="mb-2">
                        Belum ada data semester antara yang sesuai filter
                      </p>
                      <Link
                        href="/admin/semester-antara/tambah"
                        className="text-primary hover:underline text-sm font-medium">
                        Tambah semester antara pertama
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredSemester.map((semester) => {
                    const isAktif = semester.status === 'aktif';
                    const isPeriodeAktif =
                      periodeAktif === 'Semua' ||
                      semester.periode === periodeAktif;

                    return (
                      <tr
                        key={semester.id}
                        className={isAktif ? 'bg-primary/5' : ''}>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {semester.nama}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {semester.tahun}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {semester.periode}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(
                            semester.tanggalMulai
                          ).toLocaleDateString('id-ID')}{' '}
                          -{' '}
                          {new Date(
                            semester.tanggalSelesai
                          ).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              isAktif && isPeriodeAktif
                                ? 'default'
                                : 'secondary'
                            }>
                            {isAktif && isPeriodeAktif ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Link href={`/admin/semester-antara/${semester.id}/edit`}>
                              <Button variant="outline" size="xs">
                                <i className="fa-solid fa-pen mr-1"></i>
                                Edit
                              </Button>
                            </Link>
                            <Button variant="outline" size="xs">
                              <i className="fa-solid fa-book mr-1"></i>
                              Mata Kuliah
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-destructive hover:text-destructive">
                              <i className="fa-solid fa-trash mr-1"></i>
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

