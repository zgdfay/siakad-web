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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface MataKuliahItem {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  prodi: string;
  kategori: string;
  status: 'aktif' | 'nonaktif';
}

// Mock data - akan diganti dengan data dari API
const mockMataKuliahAdmin: MataKuliahItem[] = [
  {
    id: 'mk1',
    kode: 'MK001',
    nama: 'Pemrograman Web',
    sks: 3,
    prodi: 'S1 Informatika',
    kategori: 'Wajib',
    status: 'aktif',
  },
  {
    id: 'mk2',
    kode: 'MK002',
    nama: 'Basis Data',
    sks: 3,
    prodi: 'S1 Informatika',
    kategori: 'Wajib',
    status: 'aktif',
  },
  {
    id: 'mk3',
    kode: 'MK003',
    nama: 'Jaringan Komputer',
    sks: 3,
    prodi: 'S1 Informatika',
    kategori: 'Pilihan',
    status: 'nonaktif',
  },
];

export default function ManajemenMataKuliahPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredMK = mockMataKuliahAdmin.filter((mk) => {
    const matchSearch =
      mk.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mk.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mk.prodi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || mk.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Manajemen Mata Kuliah
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola mata kuliah yang tersedia untuk Semester Antara
          </p>
        </div>
        <Button size="sm" className="w-full sm:w-auto">
          <i className="fa-solid fa-plus mr-2"></i>
          Tambah Mata Kuliah
        </Button>
      </div>

      {/* Filter & Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Mata Kuliah</CardTitle>
          <CardDescription>
            {filteredMK.length} mata kuliah ditemukan dari{' '}
            {mockMataKuliahAdmin.length} data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Cari berdasarkan kode, nama, atau prodi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Kode
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Nama Mata Kuliah
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    SKS
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Prodi
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Kategori
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
                {filteredMK.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Tidak ada mata kuliah yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredMK.map((mk) => (
                    <tr key={mk.id}>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {mk.kode}
                      </td>
                      <td className="px-4 py-3 text-foreground">{mk.nama}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {mk.sks} SKS
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {mk.prodi}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {mk.kategori}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            mk.status === 'aktif' ? 'default' : 'secondary'
                          }>
                          {mk.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Button variant="outline" size="xs">
                            <i className="fa-solid fa-pen mr-1"></i>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-destructive hover:text-destructive">
                            <i className="fa-solid fa-ban mr-1"></i>
                            Nonaktifkan
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info kecil: integrasi dengan mahasiswa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informasi</CardTitle>
          <CardDescription>
            Mata kuliah yang berstatus aktif akan muncul di halaman pendaftaran
            mahasiswa untuk Semester Antara yang relevan.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}


