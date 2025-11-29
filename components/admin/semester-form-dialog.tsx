'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SemesterFormValues {
  id?: string;
  nama: string;
  tahun: string;
  periode: 'GANJIL' | 'GENAP';
  tanggalMulai: string;
  tanggalSelesai: string;
  deadlinePendaftaran: string;
  status?: 'AKTIF' | 'NONAKTIF';
}

interface SemesterFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: SemesterFormValues | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SemesterFormValues) => void;
}

export function SemesterFormDialog({
  open,
  mode,
  initialData,
  onOpenChange,
  onSubmit,
}: SemesterFormDialogProps) {
  const [formValues, setFormValues] = useState<SemesterFormValues>({
    nama: '',
    tahun: '',
    periode: 'GANJIL',
    tanggalMulai: '',
    tanggalSelesai: '',
    deadlinePendaftaran: '',
    status: 'NONAKTIF',
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Format dates from ISO string to YYYY-MM-DD for input
      setFormValues({
        ...initialData,
        tanggalMulai: initialData.tanggalMulai
          ? new Date(initialData.tanggalMulai).toISOString().split('T')[0]
          : '',
        tanggalSelesai: initialData.tanggalSelesai
          ? new Date(initialData.tanggalSelesai).toISOString().split('T')[0]
          : '',
        deadlinePendaftaran: initialData.deadlinePendaftaran
          ? new Date(initialData.deadlinePendaftaran).toISOString().split('T')[0]
          : '',
      });
    } else if (mode === 'create') {
      setFormValues({
        nama: '',
        tahun: new Date().getFullYear().toString(),
        periode: 'GANJIL',
        tanggalMulai: '',
        tanggalSelesai: '',
        deadlinePendaftaran: '',
        status: 'NONAKTIF',
      });
    }
  }, [mode, initialData, open]);

  const handleChange = (
    field: keyof SemesterFormValues,
    value: string
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (
      !formValues.nama.trim() ||
      !formValues.tahun.trim() ||
      !formValues.tanggalMulai ||
      !formValues.tanggalSelesai ||
      !formValues.deadlinePendaftaran ||
      !formValues.status
    ) {
      return;
    }

    // Validasi tanggal
    if (new Date(formValues.tanggalMulai) > new Date(formValues.tanggalSelesai)) {
      return;
    }

    onSubmit(formValues);
  };

  const isFormIncomplete =
    !formValues.nama.trim() ||
    !formValues.tahun.trim() ||
    !formValues.tanggalMulai ||
    !formValues.tanggalSelesai ||
    !formValues.deadlinePendaftaran ||
    !formValues.status ||
    new Date(formValues.tanggalMulai) > new Date(formValues.tanggalSelesai);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background shadow-lg overflow-hidden flex flex-col">
          <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
            <i className="fa-solid fa-xmark text-lg"></i>
            <span className="sr-only">Close</span>
          </DialogClose>
            <div className="overflow-y-auto flex-1 p-6">
              <div className="pb-4 mb-4 pr-8">
                <h2 className="text-xl font-semibold">
                  {mode === 'create' ? 'Tambah Semester Antara' : 'Edit Semester Antara'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === 'create'
                    ? 'Isi data semester antara dengan lengkap untuk periode baru.'
                    : 'Perbarui informasi semester antara sesuai kebutuhan.'}
                </p>
              </div>

        <div className="space-y-6 py-2">
          {/* Informasi Dasar */}
          <div className="space-y-4">
            <div className="pb-2 border-b">
              <h3 className="font-semibold text-sm text-foreground">Informasi Dasar</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium">
                  Nama Semester <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama"
                  value={formValues.nama}
                  onChange={(e) => handleChange('nama', e.target.value)}
                  placeholder="Semester Antara 2025 - Ganjil"
                  className="h-10 w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tahun" className="text-sm font-medium">
                  Tahun <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tahun"
                  value={formValues.tahun}
                  onChange={(e) => handleChange('tahun', e.target.value)}
                  placeholder="2025"
                  className="h-10 w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periode" className="text-sm font-medium">
                  Periode <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formValues.periode}
                  onValueChange={(value: 'GANJIL' | 'GENAP') =>
                    handleChange('periode', value)
                  }>
                  <SelectTrigger id="periode" className="h-10 w-full">
                    <SelectValue placeholder="Pilih Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GANJIL">Ganjil</SelectItem>
                    <SelectItem value="GENAP">Genap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value: 'AKTIF' | 'NONAKTIF') =>
                    handleChange('status', value)
                  }>
                  <SelectTrigger id="status" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Periode Waktu */}
          <div className="space-y-4">
            <div className="pb-2 border-b">
              <h3 className="font-semibold text-sm text-foreground">Periode Waktu</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggalMulai" className="text-sm font-medium">
                  Tanggal Mulai <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tanggalMulai"
                  type="date"
                  value={formValues.tanggalMulai}
                  onChange={(e) => handleChange('tanggalMulai', e.target.value)}
                  className="h-10 w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggalSelesai" className="text-sm font-medium">
                  Tanggal Selesai <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tanggalSelesai"
                  type="date"
                  value={formValues.tanggalSelesai}
                  onChange={(e) => handleChange('tanggalSelesai', e.target.value)}
                  className="h-10 w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadlinePendaftaran" className="text-sm font-medium">
                  Deadline Pendaftaran <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deadlinePendaftaran"
                  type="date"
                  value={formValues.deadlinePendaftaran}
                  onChange={(e) =>
                    handleChange('deadlinePendaftaran', e.target.value)
                  }
                  className="h-10 w-full"
                />
              </div>
            </div>

            {new Date(formValues.tanggalMulai) >
              new Date(formValues.tanggalSelesai) &&
              formValues.tanggalMulai &&
              formValues.tanggalSelesai && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <i className="fa-solid fa-triangle-exclamation text-destructive text-sm"></i>
                  <p className="text-sm text-destructive">
                    Tanggal mulai harus sebelum tanggal selesai
                  </p>
                </div>
              )}
          </div>
        </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={isFormIncomplete}>
                {mode === 'create' ? 'Simpan Semester' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}

