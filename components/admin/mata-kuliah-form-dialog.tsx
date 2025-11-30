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

export interface MataKuliahFormValues {
  id?: string;
  kode: string;
  nama: string;
  sks: number;
  prodi: string;
  kategori: 'WAJIB' | 'PILIHAN';
  status?: 'AKTIF' | 'NONAKTIF';
  deskripsi?: string;
  semesterId?: string;
  // Detail untuk assignment ke semester
  kelas?: string;
  jadwal?: string;
  tanggalJadwal?: string;
  dosen?: string;
  kuota?: number;
  biaya?: number;
  prasyarat?: string;
}

interface SemesterOption {
  id: string;
  nama: string;
  tahun: string;
  periode: string;
}

interface MataKuliahFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: MataKuliahFormValues | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MataKuliahFormValues) => void;
}

export function MataKuliahFormDialog({
  open,
  mode,
  initialData,
  onOpenChange,
  onSubmit,
}: MataKuliahFormDialogProps) {
  const [formValues, setFormValues] = useState<MataKuliahFormValues>({
    id: undefined,
    kode: '',
    nama: '',
    sks: 3,
    prodi: '',
    kategori: 'WAJIB',
    status: 'AKTIF',
    deskripsi: '',
    semesterId: '',
    kelas: 'A',
    jadwal: '',
    tanggalJadwal: '',
    dosen: '',
    kuota: 30,
    biaya: 0,
    prasyarat: '',
  });
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch semesters
  useEffect(() => {
    if (open) {
      fetchSemesters();
    }
  }, [open]);

  // Reset form values when mode changes
  useEffect(() => {
    if (!open) {
      setFormValues({
        id: undefined,
        kode: '',
        nama: '',
        sks: 3,
        prodi: '',
        kategori: 'WAJIB',
        status: 'AKTIF',
        deskripsi: '',
        semesterId: '',
        kelas: 'A',
        jadwal: '',
        tanggalJadwal: '',
        dosen: '',
        kuota: 30,
        biaya: 0,
        prasyarat: '',
      });
      setIsSubmitting(false);
    }
  }, [open]);

  const fetchSemesters = async () => {
    try {
      setLoadingSemesters(true);
      const response = await fetch('/api/semesters');
      if (!response.ok) throw new Error('Gagal mengambil data semester');
      const data = await response.json();
      setSemesters(data.semesters || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoadingSemesters(false);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormValues({
        ...initialData,
        semesterId: initialData.semesterId || '',
        kelas: initialData.kelas || 'A',
        jadwal: initialData.jadwal || '',
        tanggalJadwal: initialData.tanggalJadwal || '',
        dosen: initialData.dosen || '',
        kuota: initialData.kuota || 30,
        biaya: initialData.biaya || 0,
        prasyarat: initialData.prasyarat || '',
      });
    } else if (mode === 'create') {
      setFormValues({
        id: undefined,
        kode: '',
        nama: '',
        sks: 3,
        prodi: '',
        kategori: 'WAJIB',
        status: 'AKTIF',
        deskripsi: '',
        semesterId: '',
        kelas: 'A',
        jadwal: '',
        tanggalJadwal: '',
        dosen: '',
        kuota: 30,
        biaya: 0,
        prasyarat: '',
      });
    }
  }, [mode, initialData, open]);

  const handleChange = (
    field: keyof MataKuliahFormValues,
    value: string | number
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formValues.kode || !formValues.nama || !formValues.prodi) {
      console.warn('Form validation failed: missing required fields');
      return;
    }
    // Validate detail semester if semesterId is selected
    if (formValues.semesterId) {
      if (
        !formValues.kelas?.trim() ||
        !formValues.jadwal?.trim() ||
        !formValues.dosen?.trim() ||
        !formValues.kuota ||
        formValues.kuota < 1 ||
        formValues.biaya === undefined ||
        formValues.biaya < 0
      ) {
        console.warn('Form validation failed: missing semester details', {
          kelas: formValues.kelas,
          jadwal: formValues.jadwal,
          dosen: formValues.dosen,
          kuota: formValues.kuota,
          biaya: formValues.biaya,
        });
        return;
      }
    }
    // For create mode, semesterId is required
    if (mode === 'create' && !formValues.semesterId) {
      console.warn('Form validation failed: semesterId is required for create mode');
      return;
    }

    console.log('Submitting form with values:', formValues);
    setIsSubmitting(true);
    try {
      await onSubmit(formValues);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormIncomplete =
    !formValues.kode.trim() ||
    !formValues.nama.trim() ||
    !formValues.prodi.trim() ||
    !formValues.sks ||
    formValues.sks < 1 ||
    formValues.sks > 6 ||
    !formValues.status ||
    (mode === 'create' && !formValues.semesterId) ||
    (formValues.semesterId &&
      (!formValues.kelas?.trim() ||
        !formValues.jadwal?.trim() ||
        !formValues.dosen?.trim() ||
        formValues.kuota === undefined ||
        formValues.kuota < 1 ||
        formValues.biaya === undefined ||
        formValues.biaya < 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-5xl h-[90vh] max-h-[90vh] translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 flex flex-col overflow-hidden">
          <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
            <i className="fa-solid fa-xmark text-lg"></i>
            <span className="sr-only">Close</span>
          </DialogClose>

          {/* Header - Fixed */}
          <div className="p-6 pb-4 pr-12 border-b shrink-0">
            <h2 className="text-xl font-semibold">
              {mode === 'create' ? 'Tambah Mata Kuliah' : 'Edit Mata Kuliah'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'create'
                ? 'Isi data mata kuliah dengan lengkap.'
                : 'Perbarui informasi mata kuliah sesuai kebutuhan.'}
            </p>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 pr-12 min-h-0">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kode">
                    Kode Mata Kuliah <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="kode"
                    value={formValues.kode}
                    onChange={(e) =>
                      handleChange('kode', e.target.value.toUpperCase())
                    }
                    placeholder="MK001"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sks">
                    SKS <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sks"
                    type="number"
                    min="1"
                    max="6"
                    value={formValues.sks}
                    onChange={(e) =>
                      handleChange('sks', parseInt(e.target.value) || 0)
                    }
                    placeholder="3"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">
                  Nama Mata Kuliah <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama"
                  value={formValues.nama}
                  onChange={(e) => handleChange('nama', e.target.value)}
                  placeholder="Masukkan nama mata kuliah"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prodi">
                    Program Studi <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="prodi"
                    value={formValues.prodi}
                    onChange={(e) => handleChange('prodi', e.target.value)}
                    placeholder="S1 Informatika"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kategori">
                    Kategori <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formValues.kategori}
                    onValueChange={(value: 'WAJIB' | 'PILIHAN') =>
                      handleChange('kategori', value)
                    }>
                    <SelectTrigger id="kategori" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WAJIB">Wajib</SelectItem>
                      <SelectItem value="PILIHAN">Pilihan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formValues.status}
                    onValueChange={(value: 'AKTIF' | 'NONAKTIF') =>
                      handleChange('status', value)
                    }>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AKTIF">Aktif</SelectItem>
                      <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semesterId">
                  Semester Antara{' '}
                  {mode === 'create' && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                <Select
                  value={formValues.semesterId || undefined}
                  onValueChange={(value) => handleChange('semesterId', value)}
                  disabled={loadingSemesters || semesters.length === 0}>
                  <SelectTrigger id="semesterId" className="w-full">
                    <SelectValue
                      placeholder={
                        loadingSemesters
                          ? 'Memuat...'
                          : semesters.length === 0
                          ? 'Tidak ada semester'
                          : 'Pilih semester antara'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.length > 0
                      ? semesters.map((semester) => (
                          <SelectItem key={semester.id} value={semester.id}>
                            {semester.nama} ({semester.tahun} -{' '}
                            {semester.periode === 'GANJIL' ? 'Ganjil' : 'Genap'}
                            )
                          </SelectItem>
                        ))
                      : null}
                  </SelectContent>
                </Select>
                {mode === 'edit' && (
                  <p className="text-xs text-muted-foreground">
                    Pilih semester untuk menambahkan atau mengubah assignment
                    mata kuliah
                  </p>
                )}
              </div>

              {(mode === 'create' || formValues.semesterId) && (
                <>
                  <div className="pb-2 border-b mt-4">
                    <h3 className="font-semibold text-sm text-foreground">
                      Detail Semester
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kelas">
                        Kelas <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="kelas"
                        value={formValues.kelas || ''}
                        onChange={(e) => handleChange('kelas', e.target.value)}
                        placeholder="A"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosen">
                        Dosen <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="dosen"
                        value={formValues.dosen || ''}
                        onChange={(e) => handleChange('dosen', e.target.value)}
                        placeholder="Nama Dosen atau NIP"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jadwal">
                        Jadwal <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="jadwal"
                        value={formValues.jadwal || ''}
                        onChange={(e) => handleChange('jadwal', e.target.value)}
                        placeholder="Senin, 08:00-10:00"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tanggalJadwal">
                        Tanggal Jadwal (Opsional)
                      </Label>
                      <Input
                        id="tanggalJadwal"
                        type="datetime-local"
                        value={formValues.tanggalJadwal || ''}
                        onChange={(e) => handleChange('tanggalJadwal', e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Pilih tanggal dan waktu untuk jadwal kuliah
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kuota">
                        Kuota <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="kuota"
                        type="number"
                        min="1"
                        value={formValues.kuota || 30}
                        onChange={(e) =>
                          handleChange('kuota', parseInt(e.target.value) || 0)
                        }
                        placeholder="30"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="biaya">
                        Biaya <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="biaya"
                        type="number"
                        min="0"
                        value={formValues.biaya || 0}
                        onChange={(e) =>
                          handleChange('biaya', parseInt(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prasyarat">Prasyarat (Opsional)</Label>
                      <Input
                        id="prasyarat"
                        value={formValues.prasyarat || ''}
                        onChange={(e) =>
                          handleChange('prasyarat', e.target.value)
                        }
                        placeholder="Kode mata kuliah prasyarat"
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                <textarea
                  id="deskripsi"
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-none"
                  value={formValues.deskripsi || ''}
                  onChange={(e) => handleChange('deskripsi', e.target.value)}
                  placeholder="Masukkan deskripsi mata kuliah..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="p-6 pt-4 border-t flex justify-end gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isFormIncomplete || isSubmitting}>
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Menyimpan...
                </>
              ) : mode === 'create' ? (
                'Simpan Mata Kuliah'
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
