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
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
} from '@/components/ui/dialog';

interface SemesterMataKuliahDetail {
  id: string;
  kelas: string;
  jadwal: string;
  dosen: string;
  kuota: number;
  terisi: number;
  biaya: number;
  prasyarat: string | null;
  semester: {
    id: string;
    nama: string;
    tahun: string;
    periode: string;
  };
}

interface MataKuliahDetail {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  prodi: string;
  kategori: 'WAJIB' | 'PILIHAN';
  status: 'AKTIF' | 'NONAKTIF';
  deskripsi: string | null;
  semesterMataKuliah?: SemesterMataKuliahDetail[];
}

interface MataKuliahDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mataKuliahId: string | null;
}

export function MataKuliahDetailModal({
  open,
  onOpenChange,
  mataKuliahId,
}: MataKuliahDetailModalProps) {
  const [data, setData] = useState<MataKuliahDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && mataKuliahId) {
      fetchDetail();
    } else {
      setData(null);
    }
  }, [open, mataKuliahId]);

  const fetchDetail = async () => {
    if (!mataKuliahId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/mata-kuliah/${mataKuliahId}`);
      if (!response.ok) throw new Error('Gagal mengambil detail mata kuliah');
      const result = await response.json();

      // Transform data to match interface
      const transformedData: MataKuliahDetail = {
        ...result.mataKuliah,
        semesterMataKuliah:
          result.mataKuliah.semester?.map((sm: any) => ({
            id: sm.id,
            kelas: sm.kelas,
            jadwal: sm.jadwal,
            dosen: sm.dosen,
            kuota: sm.kuota,
            terisi: sm.terisi,
            biaya: sm.biaya,
            prasyarat: sm.prasyarat,
            semester: {
              id: sm.semester.id,
              nama: sm.semester.nama,
              tahun: sm.semester.tahun,
              periode: sm.semester.periode,
            },
          })) || [],
      };

      setData(transformedData);
    } catch (error) {
      console.error('Error fetching detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-6xl h-[90vh] translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 flex flex-col overflow-hidden">
          <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
            <i className="fa-solid fa-xmark text-lg"></i>
            <span className="sr-only">Close</span>
          </DialogClose>

          {/* Header - Fixed */}
          <div className="p-6 pb-4 pr-12 border-b shrink-0">
            <h2 className="text-xl font-semibold">Detail Mata Kuliah</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {data ? `Kode: ${data.kode}` : 'Memuat data...'}
            </p>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 pr-12 min-h-0 pb-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Memuat data...
                </div>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Kolom Kiri - Informasi Dasar */}
                <div className="h-full">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3 shrink-0">
                      <CardTitle className="text-lg">Informasi Dasar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Kode Mata Kuliah
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {data.kode}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Nama Mata Kuliah
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {data.nama}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              SKS
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {data.sks} SKS
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Kategori
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {data.kategori === 'WAJIB' ? 'Wajib' : 'Pilihan'}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Program Studi
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {data.prodi}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Status
                          </p>
                          <Badge
                            className={
                              data.status === 'AKTIF'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                            }>
                            {data.status === 'AKTIF' ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        {data.deskripsi && (
                          <div className="pt-4 border-t space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Deskripsi
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">
                              {data.deskripsi}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Kolom Kanan - Detail Semester */}
                <div className="h-full">
                  {data.semesterMataKuliah &&
                  data.semesterMataKuliah.length > 0 ? (
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-3 shrink-0">
                        <CardTitle className="text-lg">
                          Detail Semester
                        </CardTitle>
                        <CardDescription>
                          Mata kuliah ini tersedia di{' '}
                          {data.semesterMataKuliah.length}{' '}
                          {data.semesterMataKuliah.length === 1
                            ? 'semester'
                            : 'semester'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="space-y-4">
                          {data.semesterMataKuliah.map((smk) => (
                            <div
                              key={smk.id}
                              className="border rounded-lg p-4 space-y-3 bg-muted/30">
                              <div className="pb-3 border-b">
                                <p className="font-semibold text-sm text-foreground">
                                  {smk.semester.nama}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {smk.semester.tahun} -{' '}
                                  {smk.semester.periode === 'GANJIL'
                                    ? 'Ganjil'
                                    : 'Genap'}
                                </p>
                              </div>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Kelas
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                      {smk.kelas}
                                    </p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Jadwal
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                      {smk.jadwal}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Dosen
                                  </p>
                                  <p className="text-sm font-semibold text-foreground">
                                    {smk.dosen}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Kuota
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                      <span
                                        className={
                                          smk.terisi >= smk.kuota
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-foreground'
                                        }>
                                        {smk.terisi}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {' '}
                                        /{' '}
                                      </span>
                                      <span>{smk.kuota}</span>
                                      {smk.terisi >= smk.kuota && (
                                        <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                                          (Penuh)
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Biaya
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                      {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                      }).format(smk.biaya)}
                                    </p>
                                  </div>
                                </div>
                                {smk.prasyarat && (
                                  <div className="space-y-1.5 pt-2 border-t">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Prasyarat
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                      {smk.prasyarat}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-3 shrink-0">
                        <CardTitle className="text-lg">
                          Detail Semester
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                          Mata kuliah ini belum ditambahkan ke semester manapun.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
