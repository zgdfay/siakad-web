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
import {
  SemesterFormDialog,
  SemesterFormValues,
} from '@/components/admin/semester-form-dialog';
import { SemesterMataKuliahModal } from '@/components/admin/semester-mata-kuliah-modal';

interface SemesterAntara {
  id: string;
  nama: string;
  tahun: string;
  periode: 'GANJIL' | 'GENAP';
  tanggalMulai: string;
  tanggalSelesai: string;
  deadlinePendaftaran: string;
  status: 'AKTIF' | 'NONAKTIF';
  _count?: {
    pendaftaran: number;
  };
}

type PeriodeFilter = 'Semua' | 'Ganjil' | 'Genap';

export default function SemesterAntaraPage() {
  const [semesterList, setSemesterList] = useState<SemesterAntara[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodeAktif, setPeriodeAktif] = useState<PeriodeFilter>('Ganjil');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data: SemesterAntara | null;
  }>({
    open: false,
    mode: 'create',
    data: null,
  });
  const [mataKuliahModal, setMataKuliahModal] = useState<{
    open: boolean;
    semesterId: string | null;
    semesterName: string;
  }>({
    open: false,
    semesterId: null,
    semesterName: '',
  });

  // Fetch semesters from API
  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/semesters');
      if (!response.ok) throw new Error('Gagal mengambil data semester');
      const data = await response.json();
      setSemesterList(data.semesters || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      toast.error('Gagal mengambil data semester');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleSetPeriodeAktif = async (periode: PeriodeFilter) => {
    setPeriodeAktif(periode);

    try {
      // Update all semesters based on periode
      const updates = semesterList.map(async (sem) => {
        let newStatus: 'AKTIF' | 'NONAKTIF' = 'NONAKTIF';

        if (periode === 'Semua') {
          newStatus = 'AKTIF';
        } else if (sem.periode === periode.toUpperCase()) {
          newStatus = 'AKTIF';
        }

        if (sem.status !== newStatus) {
          const response = await fetch(`/api/semesters/${sem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          });

          if (!response.ok)
            throw new Error(`Gagal update semester ${sem.nama}`);
        }
      });

      await Promise.all(updates);
      toast.success('Status semester berhasil diperbarui');
      fetchSemesters(); // Refresh data
    } catch (error) {
      console.error('Error updating semester status:', error);
      toast.error('Gagal memperbarui status semester');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const response = await fetch(`/api/semesters/${deleteDialog.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus semester');
      }

      toast.success('Semester berhasil dihapus');
      setDeleteDialog({ open: false, id: null });
      fetchSemesters(); // Refresh data
    } catch (error: any) {
      console.error('Error deleting semester:', error);
      toast.error(error.message || 'Gagal menghapus semester');
    }
  };

  const handleOpenCreate = () => {
    setFormDialog({ open: true, mode: 'create', data: null });
  };

  const handleOpenEdit = (semester: SemesterAntara) => {
    setFormDialog({ open: true, mode: 'edit', data: semester });
  };

  const handleOpenMataKuliah = (semester: SemesterAntara) => {
    setMataKuliahModal({
      open: true,
      semesterId: semester.id,
      semesterName: semester.nama,
    });
  };

  const handleSubmitForm = async (values: SemesterFormValues) => {
    try {
      // Format dates to ISO string
      const payload = {
        ...values,
        tanggalMulai: new Date(values.tanggalMulai).toISOString(),
        tanggalSelesai: new Date(values.tanggalSelesai).toISOString(),
        deadlinePendaftaran: new Date(values.deadlinePendaftaran).toISOString(),
      };

      if (formDialog.mode === 'create') {
        const response = await fetch('/api/semesters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menambahkan semester');
        }

        toast.success('Semester berhasil ditambahkan');
      } else if (formDialog.mode === 'edit' && formDialog.data) {
        const response = await fetch(`/api/semesters/${formDialog.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal memperbarui semester');
        }

        toast.success('Semester berhasil diperbarui');
      }

      setFormDialog({ open: false, mode: 'create', data: null });
      fetchSemesters(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const filteredSemester = semesterList.filter((semester) => {
    const matchesSearch =
      semester.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      semester.tahun.includes(searchTerm);
    return matchesSearch;
  });

  const formatPeriode = (periode: string) => {
    return periode === 'GANJIL'
      ? 'Ganjil'
      : periode === 'GENAP'
      ? 'Genap'
      : periode;
  };

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
        <div className="flex flex-col items-stretch sm:items-end gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Periode aktif:
            </span>
            <div className="inline-flex rounded-md bg-background p-1 gap-1">
              <Button
                type="button"
                variant={periodeAktif === 'Ganjil' ? 'default' : 'ghost'}
                size="sm"
                className="px-4 transition-all hover:bg-primary/10 hover:text-primary"
                onClick={() => handleSetPeriodeAktif('Ganjil')}>
                Ganjil
              </Button>
              <Button
                type="button"
                variant={periodeAktif === 'Genap' ? 'default' : 'ghost'}
                size="sm"
                className="px-4 transition-all hover:bg-primary/10 hover:text-primary"
                onClick={() => handleSetPeriodeAktif('Genap')}>
                Genap
              </Button>
              <Button
                type="button"
                variant={periodeAktif === 'Semua' ? 'default' : 'ghost'}
                size="sm"
                className="px-4 transition-all hover:bg-primary/10 hover:text-primary hidden sm:inline-flex"
                onClick={() => handleSetPeriodeAktif('Semua')}>
                Semua
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleOpenCreate}>
            <i className="fa-solid fa-plus mr-2"></i>
            Tambah Semester Antara
          </Button>
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
                    Tanggal Mulai
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Tanggal Selesai
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Deadline Pendaftaran
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-muted-foreground text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : filteredSemester.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-muted-foreground text-sm">
                      <p className="mb-2">Belum ada data semester antara</p>
                    </td>
                  </tr>
                ) : (
                  filteredSemester.map((semester) => {
                    const isAktif = semester.status === 'AKTIF';
                    const isPeriodeAktif =
                      periodeAktif === 'Semua' ||
                      semester.periode === periodeAktif.toUpperCase();

                    return (
                      <tr key={semester.id}>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {semester.nama}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {semester.tahun}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatPeriode(semester.periode)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(semester.tanggalMulai).toLocaleDateString(
                            'id-ID',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(semester.tanggalSelesai).toLocaleDateString(
                            'id-ID',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(
                            semester.deadlinePendaftaran
                          ).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              isAktif && isPeriodeAktif
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                            }>
                            {isAktif && isPeriodeAktif ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2 text-xs justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(semester)}>
                              <i className="fa-solid fa-pen mr-1"></i>
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenMataKuliah(semester)}>
                              <i className="fa-solid fa-book mr-1"></i>
                              Mata Kuliah
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                setDeleteDialog({ open: true, id: semester.id })
                              }
                              disabled={
                                !!(
                                  semester._count?.pendaftaran &&
                                  semester._count.pendaftaran > 0
                                )
                              }>
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

      {/* Form Dialog */}
      <SemesterFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        initialData={
          formDialog.data
            ? {
                id: formDialog.data.id,
                nama: formDialog.data.nama,
                tahun: formDialog.data.tahun,
                periode: formDialog.data.periode,
                tanggalMulai: formDialog.data.tanggalMulai,
                tanggalSelesai: formDialog.data.tanggalSelesai,
                deadlinePendaftaran: formDialog.data.deadlinePendaftaran,
                status: formDialog.data.status,
              }
            : null
        }
        onOpenChange={(open) => setFormDialog({ ...formDialog, open })}
        onSubmit={handleSubmitForm}
      />

      {/* Mata Kuliah Modal */}
      <SemesterMataKuliahModal
        open={mataKuliahModal.open}
        semesterId={mataKuliahModal.semesterId}
        semesterName={mataKuliahModal.semesterName}
        onOpenChange={(open) =>
          setMataKuliahModal({ open, semesterId: null, semesterName: '' })
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semester?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semester akan dihapus secara
              permanen dan data pendaftaran akan dihapus.
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
