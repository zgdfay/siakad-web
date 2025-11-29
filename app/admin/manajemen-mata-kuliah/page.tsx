'use client';

import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserFormDialog } from '@/components/admin/user-form-dialog';
import { MataKuliahFormDialog } from '@/components/admin/mata-kuliah-form-dialog';
import { MataKuliahEditDialog } from '@/components/admin/mata-kuliah-edit-dialog';
import { MataKuliahDetailModal } from '@/components/admin/mata-kuliah-detail-modal';

interface MataKuliahItem {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  prodi: string;
  kategori: 'WAJIB' | 'PILIHAN';
  status: 'AKTIF' | 'NONAKTIF';
  deskripsi?: string | null;
}

export default function ManajemenMataKuliahPage() {
  const [mataKuliah, setMataKuliah] = useState<MataKuliahItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMataKuliahId, setEditingMataKuliahId] = useState<string | null>(
    null
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  // Fetch mata kuliah from API
  const fetchMataKuliah = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/mata-kuliah?${params.toString()}`);
      if (!response.ok) throw new Error('Gagal mengambil data mata kuliah');
      const data = await response.json();
      setMataKuliah(data.mataKuliah || []);
    } catch (error) {
      console.error('Error fetching mata kuliah:', error);
      toast.error('Gagal mengambil data mata kuliah');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMataKuliah();
  }, [statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMataKuliah();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenCreate = () => {
    setDialogOpen(true);
  };

  const handleOpenEdit = (mk: MataKuliahItem) => {
    setEditingMataKuliahId(mk.id);
    setEditDialogOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      // Extract semesterId if provided
      const { semesterId, ...mataKuliahData } = values;

      // Create mata kuliah first
      const response = await fetch('/api/mata-kuliah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mataKuliahData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menambahkan mata kuliah');
      }

      const result = await response.json();
      const newMataKuliahId = result.mataKuliah.id;

      // If semesterId is provided, assign mata kuliah to semester
      if (semesterId && newMataKuliahId) {
        try {
          const assignResponse = await fetch(
            `/api/semesters/${semesterId}/mata-kuliah`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mataKuliahId: newMataKuliahId,
                kelas: values.kelas || 'A',
                jadwal: values.jadwal || 'TBA',
                dosen: values.dosen || 'TBA',
                kuota: values.kuota || 30,
                biaya: values.biaya || 0,
                prasyarat: values.prasyarat || null,
              }),
            }
          );

          if (!assignResponse.ok) {
            const errorData = await assignResponse.json();
            throw new Error(
              errorData.error || 'Gagal mengassign mata kuliah ke semester'
            );
          }
        } catch (assignError: any) {
          toast.error(
            assignError.message || 'Gagal mengassign mata kuliah ke semester'
          );
        }
      }

      toast.success('Mata kuliah berhasil ditambahkan');
      setDialogOpen(false);
      fetchMataKuliah();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const handleEditSubmit = async (values: any) => {
    try {
      // Update mata kuliah basic info
      const { semesterAssignments, ...mataKuliahData } = values;

      const response = await fetch(`/api/mata-kuliah/${values.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mataKuliahData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal memperbarui mata kuliah');
      }

      // Handle semester assignments
      if (semesterAssignments && semesterAssignments.length > 0) {
        for (const assignment of semesterAssignments) {
          try {
            // Check if this is a new assignment (id starts with 'new-')
            if (assignment.id.startsWith('new-')) {
              // Create new assignment
              const assignResponse = await fetch(
                `/api/semesters/${assignment.semesterId}/mata-kuliah`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mataKuliahId: values.id,
                    kelas: assignment.kelas,
                    jadwal: assignment.jadwal,
                    dosen: assignment.dosen,
                    kuota: assignment.kuota,
                    biaya: assignment.biaya,
                    prasyarat: assignment.prasyarat || null,
                  }),
                }
              );

              if (!assignResponse.ok) {
                const errorData = await assignResponse.json();
                throw new Error(
                  errorData.error || 'Gagal menambahkan assignment mata kuliah'
                );
              }
            } else {
              // Update existing assignment
              const updateResponse = await fetch(
                `/api/semesters/${assignment.semesterId}/mata-kuliah/${assignment.id}`,
                {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    kelas: assignment.kelas,
                    jadwal: assignment.jadwal,
                    dosen: assignment.dosen,
                    kuota: assignment.kuota,
                    biaya: assignment.biaya,
                    prasyarat: assignment.prasyarat || null,
                  }),
                }
              );

              if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(
                  errorData.error || 'Gagal memperbarui assignment mata kuliah'
                );
              }
            }
          } catch (assignError: any) {
            toast.error(
              assignError.message || 'Gagal memperbarui assignment mata kuliah'
            );
          }
        }
      }

      toast.success('Mata kuliah berhasil diperbarui');
      setEditDialogOpen(false);
      setEditingMataKuliahId(null);
      fetchMataKuliah();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const response = await fetch(`/api/mata-kuliah/${deleteDialog.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus mata kuliah');
      }

      toast.success('Mata kuliah berhasil dihapus');
      setDeleteDialog({ open: false, id: null });
      fetchMataKuliah();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus mata kuliah');
    }
  };

  const filteredMK = mataKuliah;

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
        <Button
          size="sm"
          className="w-full sm:w-auto"
          onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus mr-2"></i>
          Tambah Mata Kuliah
        </Button>
      </div>

      {/* Filter & Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Mata Kuliah</CardTitle>
          <CardDescription>
            {loading ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Memuat...
              </span>
            ) : (
              `${filteredMK.length} mata kuliah ditemukan`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Cari berdasarkan kode, nama, atau prodi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full sm:w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Kode
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Nama Mata Kuliah
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                    SKS
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Prodi
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Kategori
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : filteredMK.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Belum ada data mata kuliah
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
                        {mk.kategori === 'WAJIB' ? 'Wajib' : 'Pilihan'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            mk.status === 'AKTIF'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                          }>
                          {mk.status === 'AKTIF' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2 text-xs justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDetailDialog({ open: true, id: mk.id })
                            }>
                            <i className="fa-solid fa-eye mr-1"></i>
                            Detail
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(mk)}>
                            <i className="fa-solid fa-pen mr-1"></i>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              setDeleteDialog({ open: true, id: mk.id })
                            }>
                            <i className="fa-solid fa-trash mr-1"></i>
                            Hapus
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

      {/* Mata Kuliah Form Dialog */}
      {/* Create Dialog */}
      <MataKuliahFormDialog
        open={dialogOpen}
        mode="create"
        initialData={null}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />

      {/* Edit Dialog */}
      <MataKuliahEditDialog
        open={editDialogOpen}
        mataKuliahId={editingMataKuliahId}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingMataKuliahId(null);
          }
        }}
        onSubmit={handleEditSubmit}
      />

      {/* Detail Modal */}
      <MataKuliahDetailModal
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog({ open, id: null })}
        mataKuliahId={detailDialog.id}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Mata Kuliah?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Mata kuliah akan dihapus
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
