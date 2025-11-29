'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MataKuliahList } from '@/components/pendaftaran/mata-kuliah-list';
import { toast } from 'sonner';

// Mock data - akan diganti dengan data dari API
const mockMataKuliah = [
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
];

export default function PilihMataKuliahPage() {
  const router = useRouter();
  const params = useParams();
  const semesterId = params.semesterId as string;
  const [selectedMataKuliah, setSelectedMataKuliah] = useState<string[]>([]);

  const handleNext = () => {
    if (selectedMataKuliah.length === 0) {
      toast.error('Pilih minimal 1 mata kuliah', {
        description: 'Silakan pilih mata kuliah yang ingin Anda daftar',
      });
      return;
    }

    // Simpan ke session storage atau state management
    sessionStorage.setItem('selectedMataKuliah', JSON.stringify(selectedMataKuliah));
    
    router.push(`/mahasiswa/pendaftaran/${semesterId}/checkout`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Pilih Mata Kuliah
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih mata kuliah yang ingin Anda daftar untuk semester antara
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Mata Kuliah Tersedia</CardTitle>
            <CardDescription>
              Maksimal 24 SKS per semester antara
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MataKuliahList
              mataKuliah={mockMataKuliah}
              selectedMataKuliah={selectedMataKuliah}
              onSelectionChange={setSelectedMataKuliah}
              onNext={handleNext}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

