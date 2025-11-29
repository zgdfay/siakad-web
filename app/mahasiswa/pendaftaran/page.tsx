'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SemesterMataKuliahGroup } from '@/components/pendaftaran/semester-mata-kuliah-group';
import { toast } from 'sonner';

// Mock data - akan diganti dengan data dari API
// Admin bisa set semester ganjil/genap aktif, yang tidak aktif akan disabled
const mockSemesterAntara = [
  {
    id: '1',
    nama: 'Semester Antara 2025 - Ganjil',
    tahun: '2025',
    periode: 'Ganjil',
    tanggalMulai: '2025-07-01',
    tanggalSelesai: '2025-08-31',
    deadlinePendaftaran: '2025-06-25',
    status: 'aktif' as const, // Admin set ganjil aktif
    mataKuliah: [
      {
        id: 'mk1',
        kode: 'MK001',
        nama: 'Pemrograman Web',
        sks: 3,
        kelas: 'A',
        jadwal: 'Senin, 08:00-10:00',
        dosen: 'Dr. Ahmad Fauzi',
        kuota: 30,
        terisi: 25,
        biaya: 500000,
        prasyarat: ['Algoritma', 'Struktur Data'],
      },
      {
        id: 'mk2',
        kode: 'MK002',
        nama: 'Basis Data',
        sks: 3,
        kelas: 'B',
        jadwal: 'Selasa, 10:00-12:00',
        dosen: 'Dr. Siti Nurhaliza',
        kuota: 25,
        terisi: 20,
        biaya: 500000,
      },
      {
        id: 'mk3',
        kode: 'MK003',
        nama: 'Jaringan Komputer',
        sks: 3,
        kelas: 'A',
        jadwal: 'Rabu, 13:00-15:00',
        dosen: 'Dr. Budi Santoso',
        kuota: 20,
        terisi: 15,
        biaya: 500000,
      },
      {
        id: 'mk4',
        kode: 'MK004',
        nama: 'Kecerdasan Buatan',
        sks: 4,
        kelas: 'A',
        jadwal: 'Kamis, 08:00-11:00',
        dosen: 'Dr. Rina Wati',
        kuota: 25,
        terisi: 18,
        biaya: 600000,
        prasyarat: ['Machine Learning'],
      },
    ],
  },
  {
    id: '2',
    nama: 'Semester Antara 2025 - Genap',
    tahun: '2025',
    periode: 'Genap',
    tanggalMulai: '2025-12-01',
    tanggalSelesai: '2026-01-31',
    deadlinePendaftaran: '2025-11-25',
    status: 'nonaktif' as const, // Admin set genap nonaktif (disabled)
    mataKuliah: [
      {
        id: 'mk5',
        kode: 'MK005',
        nama: 'Pemrograman Mobile',
        sks: 3,
        kelas: 'A',
        jadwal: 'Senin, 10:00-12:00',
        dosen: 'Dr. Andi Pratama',
        kuota: 30,
        terisi: 0,
        biaya: 500000,
      },
      {
        id: 'mk6',
        kode: 'MK006',
        nama: 'Cloud Computing',
        sks: 4,
        kelas: 'B',
        jadwal: 'Selasa, 13:00-16:00',
        dosen: 'Dr. Sari Indah',
        kuota: 25,
        terisi: 0,
        biaya: 600000,
      },
    ],
  },
  {
    id: '3',
    nama: 'Semester Antara 2024 - Ganjil',
    tahun: '2024',
    periode: 'Ganjil',
    tanggalMulai: '2024-07-01',
    tanggalSelesai: '2024-08-31',
    deadlinePendaftaran: '2024-06-25',
    status: 'nonaktif' as const, // Semester lalu
    mataKuliah: [
      {
        id: 'mk7',
        kode: 'MK007',
        nama: 'Sistem Operasi',
        sks: 3,
        kelas: 'A',
        jadwal: 'Rabu, 08:00-10:00',
        dosen: 'Dr. Joko Widodo',
        kuota: 30,
        terisi: 30,
        biaya: 500000,
      },
    ],
  },
];

export default function PilihSemesterAntaraPage() {
  const router = useRouter();
  const [selectedMataKuliah, setSelectedMataKuliah] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const maxSKS = 24;

  // Flatten semua mata kuliah untuk search
  const allMataKuliah = mockSemesterAntara.flatMap((sem) =>
    sem.mataKuliah.map((mk) => ({ ...mk, semesterId: sem.id }))
  );

  // Filter mata kuliah berdasarkan search
  const filteredSemester = mockSemesterAntara.map((sem) => ({
    ...sem,
    mataKuliah: sem.mataKuliah.filter(
      (mk) =>
        mk.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mk.kode.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((sem) => sem.mataKuliah.length > 0);

  // Hitung total SKS dan biaya
  const selectedMK = allMataKuliah.filter((mk) =>
    selectedMataKuliah.includes(mk.id)
  );
  const totalSKS = selectedMK.reduce((sum, mk) => sum + mk.sks, 0);
  const totalBiaya = selectedMK.reduce((sum, mk) => sum + mk.biaya, 0);

  const handleSelectionChange = (mkId: string, semesterId: string) => {
    if (selectedMataKuliah.includes(mkId)) {
      setSelectedMataKuliah(selectedMataKuliah.filter((id) => id !== mkId));
    } else {
      setSelectedMataKuliah([...selectedMataKuliah, mkId]);
    }
  };

  const handleNext = () => {
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

    // Validasi: hanya bisa pilih dari semester aktif (disabled untuk testing)
    // const selectedFromInactive = selectedMK.some((mk) => {
    //   const semester = mockSemesterAntara.find((s) => s.id === mk.semesterId);
    //   return semester?.status === 'nonaktif';
    // });

    // if (selectedFromInactive) {
    //   toast.error('Pendaftaran tidak valid', {
    //     description: 'Hanya bisa memilih mata kuliah dari semester aktif',
    //   });
    //   return;
    // }

    // Simpan ke session storage
    const semesterId = selectedMK[0]?.semesterId || mockSemesterAntara[0].id;
    sessionStorage.setItem('selectedMataKuliah', JSON.stringify(selectedMataKuliah));
    sessionStorage.setItem(
      'checkoutData',
      JSON.stringify({
        semesterId,
        mataKuliah: selectedMK.map(({ semesterId, ...mk }) => mk),
        totalBiaya,
      })
    );

    toast.success('Data tersimpan', {
      description: 'Lanjutkan ke halaman checkout',
    });

    router.push(`/mahasiswa/pendaftaran/${semesterId}/checkout`);
  };

  const activeSemester = mockSemesterAntara.filter((s) => s.status === 'aktif');
  const inactiveSemester = mockSemesterAntara.filter((s) => s.status === 'nonaktif');

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
              Pilih mata kuliah yang ingin Anda daftar. Hanya semester aktif yang dapat dipilih.
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
                    semester={semester}
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
              <h2 className="text-lg font-semibold text-foreground text-muted-foreground">
                Semester Tidak Tersedia
              </h2>
              {inactiveSemester
                .filter((sem) =>
                  filteredSemester.some((fs) => fs.id === sem.id)
                )
                .map((semester) => (
                  <SemesterMataKuliahGroup
                    key={semester.id}
                    semester={semester}
                    selectedMataKuliah={selectedMataKuliah}
                    onSelectionChange={handleSelectionChange}
                    maxSKS={maxSKS}
                    totalSKSSelected={totalSKS}
                  />
                ))}
            </div>
          )}

          {filteredSemester.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Tidak ada mata kuliah yang ditemukan
                </p>
              </CardContent>
            </Card>
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
                  <span className="text-muted-foreground">Mata Kuliah Dipilih</span>
                  <span className="font-medium">{selectedMataKuliah.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total SKS</span>
                  <span className={`font-medium ${totalSKS > maxSKS ? 'text-destructive' : ''}`}>
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
