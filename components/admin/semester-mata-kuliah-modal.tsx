'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SemesterMataKuliah {
  id: string;
  kelas: string;
  jadwal: string;
  dosen: string;
  kuota: number;
  terisi: number;
  biaya: number;
  prasyarat: string | null;
  mataKuliah: {
    id: string;
    kode: string;
    nama: string;
    sks: number;
    prodi: string;
    kategori: 'WAJIB' | 'PILIHAN';
    status: 'AKTIF' | 'NONAKTIF';
  };
  _count: {
    pendaftaranDetail: number;
  };
}

interface SemesterMataKuliahModalProps {
  open: boolean;
  semesterId: string | null;
  semesterName?: string;
  onOpenChange: (open: boolean) => void;
}

export function SemesterMataKuliahModal({
  open,
  semesterId,
  semesterName,
  onOpenChange,
}: SemesterMataKuliahModalProps) {
  const [data, setData] = useState<SemesterMataKuliah[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && semesterId) {
      fetchMataKuliah();
    } else {
      setData([]);
    }
  }, [open, semesterId]);

  const fetchMataKuliah = async () => {
    if (!semesterId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/semesters/${semesterId}/mata-kuliah`);
      if (!response.ok) throw new Error('Gagal mengambil data mata kuliah');
      const result = await response.json();
      setData(result.mataKuliah || []);
    } catch (error) {
      console.error('Error fetching mata kuliah:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-6xl h-[90vh] translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background shadow-lg animate-in fade-in-0 zoom-in-95 flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
          <i className="fa-solid fa-xmark text-lg"></i>
          <span className="sr-only">Close</span>
        </button>

        {/* Header - Fixed */}
        <div className="p-6 pb-4 pr-12 border-b shrink-0">
          <h2 className="text-xl font-semibold">Mata Kuliah Semester</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {semesterName || 'Memuat data...'}
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
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                Belum ada mata kuliah yang terdaftar di semester ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {item.mataKuliah.kode} - {item.mataKuliah.nama}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {item.mataKuliah.sks} SKS
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.mataKuliah.kategori === 'WAJIB'
                              ? 'Wajib'
                              : 'Pilihan'}
                          </Badge>
                          <Badge
                            className={
                              item.mataKuliah.status === 'AKTIF'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                            }>
                            {item.mataKuliah.status === 'AKTIF'
                              ? 'Aktif'
                              : 'Nonaktif'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Program Studi
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {item.mataKuliah.prodi}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Kelas
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {item.kelas}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Jadwal
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {item.jadwal}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Dosen
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {item.dosen}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Kuota
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          <span
                            className={
                              item.terisi >= item.kuota
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-foreground'
                            }>
                            {item.terisi}
                          </span>
                          <span className="text-muted-foreground"> / </span>
                          <span>{item.kuota}</span>
                          {item.terisi >= item.kuota && (
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
                          }).format(item.biaya)}
                        </p>
                      </div>
                      {item.prasyarat && (
                        <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Prasyarat
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {item.prasyarat}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
