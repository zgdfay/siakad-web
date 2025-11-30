'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SemesterMataKuliahGroup } from '@/components/pendaftaran/semester-mata-kuliah-group';
import { toast } from 'sonner';

interface SemesterMataKuliah {
  id: string;
  kelas: string;
  jadwal: string;
  tanggalJadwal?: string | Date | null;
  dosen: string;
  kuota: number;
  terisi: number;
  biaya: number;
  prasyarat?: string | null;
  mataKuliah: {
    id: string;
    kode: string;
    nama: string;
    sks: number;
  };
}

interface Semester {
  id: string;
  nama: string;
  tahun: string;
  periode: 'GANJIL' | 'GENAP';
  tanggalMulai: string;
  tanggalSelesai: string;
  deadlinePendaftaran: string;
  status: 'AKTIF' | 'NONAKTIF';
  mataKuliah: SemesterMataKuliah[];
}

export default function PilihSemesterAntaraPage() {
  const router = useRouter();
  const [semesterList, setSemesterList] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMataKuliah, setSelectedMataKuliah] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const maxSKS = 24;

  // Fetch semesters from API
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/semesters?status=AKTIF');
        if (!response.ok) throw new Error('Gagal mengambil data semester');
        const data = await response.json();

        // Transform data to match component interface
        const transformedSemesters: Semester[] = (data.semesters || []).map(
          (sem: any) => ({
            id: sem.id,
            nama: sem.nama,
            tahun: sem.tahun,
            periode: sem.periode,
            tanggalMulai: sem.tanggalMulai,
            tanggalSelesai: sem.tanggalSelesai,
            deadlinePendaftaran: sem.deadlinePendaftaran,
            status: sem.status,
            mataKuliah: sem.mataKuliah.map((smk: any) => ({
              id: smk.id,
              kelas: smk.kelas,
              jadwal: smk.jadwal,
              tanggalJadwal: smk.tanggalJadwal || null,
              dosen: smk.dosen,
              kuota: smk.kuota,
              terisi: smk.terisi,
              biaya: smk.biaya,
              prasyarat: smk.prasyarat,
              mataKuliah: {
                id: smk.mataKuliah.id,
                kode: smk.mataKuliah.kode,
                nama: smk.mataKuliah.nama,
                sks: smk.mataKuliah.sks,
              },
            })),
          })
        );

        setSemesterList(transformedSemesters);
      } catch (error) {
        console.error('Error fetching semesters:', error);
        toast.error('Gagal mengambil data semester');
      } finally {
        setLoading(false);
      }
    };

    fetchSemesters();
  }, []);

  // Flatten semua mata kuliah untuk search
  const allMataKuliah = semesterList.flatMap((sem) =>
    sem.mataKuliah.map((smk) => ({
      id: smk.id,
      kode: smk.mataKuliah.kode,
      nama: smk.mataKuliah.nama,
      sks: smk.mataKuliah.sks,
      kelas: smk.kelas,
      jadwal: smk.jadwal,
      dosen: smk.dosen,
      kuota: smk.kuota,
      terisi: smk.terisi,
      biaya: smk.biaya,
      prasyarat: smk.prasyarat,
      semesterId: sem.id,
    }))
  );

  // Filter mata kuliah berdasarkan search
  const filteredSemester = semesterList
    .map((sem) => ({
      ...sem,
      mataKuliah: sem.mataKuliah.filter(
        (smk) =>
          smk.mataKuliah.nama
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          smk.mataKuliah.kode.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((sem) => sem.mataKuliah.length > 0);

  // Hitung total SKS dan biaya
  const selectedMK = allMataKuliah.filter((mk) =>
    selectedMataKuliah.includes(mk.id)
  );
  const totalSKS = selectedMK.reduce((sum, mk) => sum + mk.sks, 0);
  const totalBiaya = selectedMK.reduce((sum, mk) => sum + mk.biaya, 0);

  const handleSelectionChange = (mkId: string, semesterId: string) => {
    // Cari semester yang sesuai
    const semester = semesterList.find((s) => s.id === semesterId);
    if (!semester) return;

    // Cek apakah semester aktif
    if (semester.status !== 'AKTIF') {
      toast.error('Semester tidak aktif', {
        description:
          'Tidak dapat memilih mata kuliah dari semester yang tidak aktif',
      });
      return;
    }

    // Cek deadline
    const isDeadlinePassed =
      new Date() > new Date(semester.deadlinePendaftaran);
    if (isDeadlinePassed) {
      toast.error('Deadline sudah lewat', {
        description: 'Pendaftaran untuk semester ini sudah ditutup',
      });
      return;
    }

    if (selectedMataKuliah.includes(mkId)) {
      setSelectedMataKuliah(selectedMataKuliah.filter((id) => id !== mkId));
    } else {
      // Check if mata kuliah is from same semester
      const selectedFromDifferentSemester = selectedMataKuliah.some((id) => {
        const mk = allMataKuliah.find((m) => m.id === id);
        return mk && mk.semesterId !== semesterId;
      });

      if (selectedFromDifferentSemester) {
        toast.error('Tidak dapat memilih mata kuliah dari semester berbeda', {
          description: 'Pilih mata kuliah dari semester yang sama',
        });
        return;
      }

      // Check quota
      const mk = allMataKuliah.find((m) => m.id === mkId);
      if (mk && mk.terisi >= mk.kuota) {
        toast.error('Kuota penuh', {
          description: `Mata kuliah ${mk.nama} sudah penuh`,
        });
        return;
      }

      setSelectedMataKuliah([...selectedMataKuliah, mkId]);
    }
  };

  const handleNext = async () => {
    if (selectedMataKuliah.length === 0) {
      toast.error('Pilih minimal 1 mata kuliah', {
        description: 'Silakan pilih mata kuliah yang ingin Anda daftar',
      });
      return;
    }

    if (totalSKS > maxSKS) {
      toast.error('SKS melebihi batas', {
        description: `Maksimal ${maxSKS} SKS per semester antara`,
      });
      return;
    }

    // Validate: semua harus dari semester aktif
    const selectedFromInactive = selectedMK.some((mk) => {
      const semester = semesterList.find((s) => s.id === mk.semesterId);
      return semester?.status !== 'AKTIF';
    });

    if (selectedFromInactive) {
      toast.error('Pendaftaran tidak valid', {
        description: 'Hanya bisa memilih mata kuliah dari semester aktif',
      });
      return;
    }

    // Check deadline
    const semesterId = selectedMK[0]?.semesterId;
    const semester = semesterList.find((s) => s.id === semesterId);
    if (semester && new Date() > new Date(semester.deadlinePendaftaran)) {
      toast.error('Deadline sudah lewat', {
        description: 'Pendaftaran untuk semester ini sudah ditutup',
      });
      return;
    }

    // Validate: semua mata kuliah harus dari semester yang sama
    const allSameSemester = selectedMK.every(
      (mk) => mk.semesterId === semesterId
    );
    if (!allSameSemester) {
      toast.error('Pendaftaran tidak valid', {
        description: 'Semua mata kuliah harus dari semester yang sama',
      });
      return;
    }

    // Simpan data untuk checkout page
    const checkoutData = {
      semesterId,
      mataKuliah: selectedMK.map((mk) => ({
        id: mk.id,
        kode: mk.kode,
        nama: mk.nama,
        sks: mk.sks,
        biaya: mk.biaya,
      })),
      totalBiaya,
    };

    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

    // Redirect ke checkout page
    router.push(`/mahasiswa/pendaftaran/${semesterId}/checkout`);
  };

  const activeSemester = semesterList.filter((s) => s.status === 'AKTIF');
  const inactiveSemester = semesterList.filter((s) => s.status === 'NONAKTIF');

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Pendaftaran Semester Antara
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pilih mata kuliah yang ingin Anda daftar. Hanya semester aktif
              yang dapat dipilih.
            </p>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Cari Mata Kuliah
            </Label>
            <Input
              id="search"
              placeholder="Cari berdasarkan nama atau kode mata kuliah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10"
            />
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Memuat data semester...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Semester Aktif */}
              {activeSemester.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Semester Aktif
                  </h2>
                  {activeSemester
                    .filter((sem) =>
                      filteredSemester.some((fs) => fs.id === sem.id)
                    )
                    .map((semester) => (
                      <SemesterMataKuliahGroup
                        key={semester.id}
                        semester={{
                          id: semester.id,
                          nama: semester.nama,
                          tahun: semester.tahun,
                          periode:
                            semester.periode === 'GANJIL' ? 'Ganjil' : 'Genap',
                          tanggalMulai: semester.tanggalMulai,
                          tanggalSelesai: semester.tanggalSelesai,
                          deadlinePendaftaran: semester.deadlinePendaftaran,
                          status:
                            semester.status === 'AKTIF' ? 'aktif' : 'nonaktif',
                          mataKuliah: semester.mataKuliah.map((smk) => ({
                            id: smk.id,
                            kode: smk.mataKuliah.kode,
                            nama: smk.mataKuliah.nama,
                            sks: smk.mataKuliah.sks,
                            kelas: smk.kelas,
                            jadwal: smk.jadwal,
                            tanggalJadwal: smk.tanggalJadwal || null,
                            dosen: smk.dosen,
                            kuota: smk.kuota,
                            terisi: smk.terisi,
                            biaya: smk.biaya,
                            prasyarat: smk.prasyarat
                              ? (() => {
                                  try {
                                    const parsed = JSON.parse(smk.prasyarat);
                                    return Array.isArray(parsed)
                                      ? parsed
                                      : [smk.prasyarat];
                                  } catch {
                                    return [smk.prasyarat];
                                  }
                                })()
                              : undefined,
                          })),
                        }}
                        selectedMataKuliah={selectedMataKuliah}
                        onSelectionChange={handleSelectionChange}
                        maxSKS={maxSKS}
                        totalSKSSelected={totalSKS}
                      />
                    ))}
                </div>
              )}

              {/* Semester Nonaktif */}
              {inactiveSemester.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-muted-foreground">
                    Semester Tidak Tersedia
                  </h2>
                  {inactiveSemester
                    .filter((sem) =>
                      filteredSemester.some((fs) => fs.id === sem.id)
                    )
                    .map((semester) => (
                      <SemesterMataKuliahGroup
                        key={semester.id}
                        semester={{
                          id: semester.id,
                          nama: semester.nama,
                          tahun: semester.tahun,
                          periode:
                            semester.periode === 'GANJIL' ? 'Ganjil' : 'Genap',
                          tanggalMulai: semester.tanggalMulai,
                          tanggalSelesai: semester.tanggalSelesai,
                          deadlinePendaftaran: semester.deadlinePendaftaran,
                          status: 'nonaktif',
                          mataKuliah: semester.mataKuliah.map((smk) => ({
                            id: smk.id,
                            kode: smk.mataKuliah.kode,
                            nama: smk.mataKuliah.nama,
                            sks: smk.mataKuliah.sks,
                            kelas: smk.kelas,
                            jadwal: smk.jadwal,
                            tanggalJadwal: smk.tanggalJadwal || null,
                            dosen: smk.dosen,
                            kuota: smk.kuota,
                            terisi: smk.terisi,
                            biaya: smk.biaya,
                            prasyarat: smk.prasyarat
                              ? (() => {
                                  try {
                                    const parsed = JSON.parse(smk.prasyarat);
                                    return Array.isArray(parsed)
                                      ? parsed
                                      : [smk.prasyarat];
                                  } catch {
                                    return [smk.prasyarat];
                                  }
                                })()
                              : undefined,
                          })),
                        }}
                        selectedMataKuliah={selectedMataKuliah}
                        onSelectionChange={handleSelectionChange}
                        maxSKS={maxSKS}
                        totalSKSSelected={totalSKS}
                      />
                    ))}
                </div>
              )}

              {filteredSemester.length === 0 && !loading && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Tidak ada mata kuliah yang ditemukan
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Ringkasan Pendaftaran</CardTitle>
              <CardDescription>
                Maksimal {maxSKS} SKS per semester antara
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Mata Kuliah Dipilih
                  </span>
                  <span className="font-medium">
                    {selectedMataKuliah.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total SKS</span>
                  <span
                    className={`font-medium ${
                      totalSKS > maxSKS ? 'text-destructive' : ''
                    }`}>
                    {totalSKS} / {maxSKS}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Biaya</span>
                    <span className="text-xl font-bold text-primary">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(totalBiaya)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedMataKuliah.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-medium">Mata Kuliah Dipilih:</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {selectedMK.map((mk) => (
                      <div
                        key={mk.id}
                        className="text-xs p-2 bg-muted rounded flex items-center justify-between">
                        <span className="truncate flex-1">{mk.nama}</span>
                        <span className="ml-2 text-muted-foreground">
                          {mk.sks} SKS
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleNext}
                disabled={selectedMataKuliah.length === 0 || totalSKS > maxSKS}
                className="w-full"
                size="lg">
                {selectedMataKuliah.length === 0
                  ? 'Pilih Mata Kuliah'
                  : totalSKS > maxSKS
                  ? `SKS Melebihi Batas (${totalSKS}/${maxSKS})`
                  : `Lanjutkan ke Checkout (${selectedMataKuliah.length})`}
              </Button>

              {totalSKS > maxSKS && (
                <p className="text-sm text-destructive text-center">
                  Maksimal {maxSKS} SKS per semester antara
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
