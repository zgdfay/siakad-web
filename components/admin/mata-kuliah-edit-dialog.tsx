'use client';

import { useEffect, useState } from 'react';
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
import { toast } from 'sonner';

export interface MataKuliahEditValues {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  prodi: string;
  kategori: 'WAJIB' | 'PILIHAN';
  status: 'AKTIF' | 'NONAKTIF';
  deskripsi?: string | null;
  semesterAssignments?: {
    id: string;
    semesterId: string;
    kelas: string;
    jadwal: string;
    tanggalJadwal?: string | Date | null;
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
  }[];
}

interface SemesterOption {
  id: string;
  nama: string;
  tahun: string;
  periode: string;
}

interface MataKuliahEditDialogProps {
  open: boolean;
  mataKuliahId: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MataKuliahEditValues) => void;
}

export function MataKuliahEditDialog({
  open,
  mataKuliahId,
  onOpenChange,
  onSubmit,
}: MataKuliahEditDialogProps) {
  const [formValues, setFormValues] = useState<MataKuliahEditValues>({
    id: '',
    kode: '',
    nama: '',
    sks: 3,
    prodi: '',
    kategori: 'WAJIB',
    status: 'AKTIF',
    deskripsi: '',
    semesterAssignments: [],
  });
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [newAssignment, setNewAssignment] = useState({
    kelas: 'A',
    jadwal: '',
    tanggalJadwal: '',
    dosen: '',
    kuota: 30,
    biaya: 0,
    prasyarat: '',
  });

  // Fetch semesters
  useEffect(() => {
    if (open) {
      fetchSemesters();
    }
  }, [open]);

  // Fetch mata kuliah data
  useEffect(() => {
    if (open && mataKuliahId) {
      fetchMataKuliahData();
    } else if (!open) {
      // Reset form when closed
      setFormValues({
        id: '',
        kode: '',
        nama: '',
        sks: 3,
        prodi: '',
        kategori: 'WAJIB',
        status: 'AKTIF',
        deskripsi: '',
        semesterAssignments: [],
      });
      setSelectedSemesterId('');
      setNewAssignment({
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
  }, [open, mataKuliahId]);

  const fetchSemesters = async () => {
    try {
      setLoadingSemesters(true);
      const response = await fetch('/api/semesters');
      if (!response.ok) throw new Error('Gagal mengambil data semester');
      const data = await response.json();
      // Transform data to match interface
      const transformedSemesters: SemesterOption[] = (data.semesters || []).map(
        (sem: any) => ({
          id: sem.id,
          nama: sem.nama,
          tahun: sem.tahun,
          periode: sem.periode,
        })
      );
      setSemesters(transformedSemesters);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      toast.error('Gagal mengambil data semester');
      setSemesters([]);
    } finally {
      setLoadingSemesters(false);
    }
  };

  const fetchMataKuliahData = async () => {
    if (!mataKuliahId) return;

    try {
      setLoadingData(true);
      const response = await fetch(`/api/mata-kuliah/${mataKuliahId}`);
      if (!response.ok) throw new Error('Gagal mengambil data mata kuliah');
      const data = await response.json();

      // Transform data
      const transformedData: MataKuliahEditValues = {
        id: data.mataKuliah.id,
        kode: data.mataKuliah.kode,
        nama: data.mataKuliah.nama,
        sks: data.mataKuliah.sks,
        prodi: data.mataKuliah.prodi,
        kategori: data.mataKuliah.kategori,
        status: data.mataKuliah.status,
        deskripsi: data.mataKuliah.deskripsi || '',
        semesterAssignments:
          data.mataKuliah.semester?.map((sm: any) => ({
            id: sm.id,
            semesterId: sm.semester.id,
            kelas: sm.kelas,
            jadwal: sm.jadwal,
            tanggalJadwal: sm.tanggalJadwal || null,
            dosen: sm.dosen,
            kuota: sm.kuota,
            terisi: sm.terisi || 0,
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

      setFormValues(transformedData);
    } catch (error) {
      console.error('Error fetching mata kuliah data:', error);
      toast.error('Gagal mengambil data mata kuliah');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    field: keyof MataKuliahEditValues,
    value: string | number
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewAssignmentChange = (field: string, value: string | number) => {
    setNewAssignment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAssignment = () => {
    if (
      !selectedSemesterId ||
      !newAssignment.kelas?.trim() ||
      !newAssignment.jadwal?.trim() ||
      !newAssignment.dosen?.trim() ||
      !newAssignment.kuota ||
      newAssignment.kuota < 1 ||
      newAssignment.biaya === undefined ||
      newAssignment.biaya < 0
    ) {
      toast.error('Lengkapi semua field detail semester');
      return;
    }

    const selectedSemester = semesters.find((s) => s.id === selectedSemesterId);
    if (!selectedSemester) return;

    const assignment = {
      id: `new-${Date.now()}`,
      semesterId: selectedSemesterId,
      kelas: newAssignment.kelas,
      jadwal: newAssignment.jadwal,
      tanggalJadwal: newAssignment.tanggalJadwal || null,
      dosen: newAssignment.dosen,
      kuota: newAssignment.kuota,
      terisi: 0,
      biaya: newAssignment.biaya,
      prasyarat: newAssignment.prasyarat || null,
      semester: {
        id: selectedSemester.id,
        nama: selectedSemester.nama,
        tahun: selectedSemester.tahun,
        periode: selectedSemester.periode,
      },
    };

    setFormValues((prev) => ({
      ...prev,
      semesterAssignments: [...(prev.semesterAssignments || []), assignment],
    }));

    // Reset new assignment form
    setSelectedSemesterId('');
    setNewAssignment({
      kelas: 'A',
      jadwal: '',
      tanggalJadwal: '',
      dosen: '',
      kuota: 30,
      biaya: 0,
      prasyarat: '',
    });
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    setFormValues((prev) => ({
      ...prev,
      semesterAssignments:
        prev.semesterAssignments?.filter((a) => a.id !== assignmentId) || [],
    }));
  };

  const handleUpdateAssignment = (
    assignmentId: string,
    field: string,
    value: string | number
  ) => {
    setFormValues((prev) => ({
      ...prev,
      semesterAssignments:
        prev.semesterAssignments?.map((a) =>
          a.id === assignmentId ? { ...a, [field]: value } : a
        ) || [],
    }));
  };

  const handleSubmit = async () => {
    if (
      !formValues.kode.trim() ||
      !formValues.nama.trim() ||
      !formValues.prodi.trim()
    ) {
      toast.error('Lengkapi semua field yang wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formValues);
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
    !formValues.status;

  if (!open) return null;

  if (loadingData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
        {/* Loading Content */}
        <div className="relative z-50 w-full max-w-5xl max-h-[90vh] rounded-lg border bg-background shadow-lg flex items-center justify-center p-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <i className="fa-solid fa-spinner fa-spin"></i>
            Memuat data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Main Content */}
      <div className="relative z-50 w-full max-w-5xl max-h-[90vh] rounded-lg border bg-background shadow-lg flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-background/80 backdrop-blur-sm p-2"
          aria-label="Close">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Header - Fixed */}
        <div className="p-6 pb-4 pr-12 border-b shrink-0">
          <h2 className="text-xl font-semibold">Edit Mata Kuliah</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Perbarui informasi mata kuliah dan assignment semester.
          </p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 pr-12 min-h-0">
          <div className="space-y-4 py-2">
            {/* Basic Info */}
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

            {/* Existing Assignments */}
            {formValues.semesterAssignments &&
              formValues.semesterAssignments.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-sm text-foreground">
                    Assignment Semester
                  </h3>
                  {formValues.semesterAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="border rounded-lg p-4 space-y-3 bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {assignment.semester.nama}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {assignment.semester.tahun} -{' '}
                            {assignment.semester.periode === 'GANJIL'
                              ? 'Ganjil'
                              : 'Genap'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="text-destructive hover:text-destructive">
                          <i className="fa-solid fa-trash"></i>
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Kelas</Label>
                          <Input
                            value={assignment.kelas}
                            onChange={(e) =>
                              handleUpdateAssignment(
                                assignment.id,
                                'kelas',
                                e.target.value
                              )
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Jadwal</Label>
                          <Input
                            value={assignment.jadwal}
                            onChange={(e) =>
                              handleUpdateAssignment(
                                assignment.id,
                                'jadwal',
                                e.target.value
                              )
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Tanggal Jadwal</Label>
                          <Input
                            type="date"
                            value={
                              assignment.tanggalJadwal
                                ? typeof assignment.tanggalJadwal === 'string'
                                  ? assignment.tanggalJadwal.includes('T')
                                    ? assignment.tanggalJadwal.slice(0, 10)
                                    : new Date(assignment.tanggalJadwal)
                                        .toISOString()
                                        .slice(0, 10)
                                  : new Date(assignment.tanggalJadwal)
                                      .toISOString()
                                      .slice(0, 10)
                                : ''
                            }
                            onChange={(e) =>
                              handleUpdateAssignment(
                                assignment.id,
                                'tanggalJadwal',
                                e.target.value
                              )
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Dosen</Label>
                          <Input
                            value={assignment.dosen}
                            onChange={(e) =>
                              handleUpdateAssignment(
                                assignment.id,
                                'dosen',
                                e.target.value
                              )
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Kuota</Label>
                          <Input
                            type="number"
                            min="1"
                            value={assignment.kuota}
                            onChange={(e) =>
                              handleUpdateAssignment(
                                assignment.id,
                                'kuota',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Biaya</Label>
                          <Input
                            type="number"
                            min="0"
                            value={assignment.biaya}
                            onChange={(e) =>
                              handleUpdateAssignment(
                                assignment.id,
                                'biaya',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Prasyarat</Label>
                          <Input
                            value={assignment.prasyarat || ''}
                            onChange={(e) =>
                              handleUpdateAssignment(
                                assignment.id,
                                'prasyarat',
                                e.target.value
                              )
                            }
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Add New Assignment */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm text-foreground">
                Tambah Assignment Semester Baru
              </h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="newSemesterId">Pilih Semester</Label>
                  <Select
                    value={selectedSemesterId}
                    onValueChange={setSelectedSemesterId}
                    disabled={loadingSemesters || semesters.length === 0}>
                    <SelectTrigger id="newSemesterId" className="w-full">
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
                      {semesters.length > 0 ? (
                        semesters
                          .filter(
                            (s) =>
                              !formValues.semesterAssignments?.some(
                                (a) => a.semesterId === s.id
                              )
                          )
                          .map((semester) => (
                            <SelectItem key={semester.id} value={semester.id}>
                              {semester.nama} ({semester.tahun} -{' '}
                              {semester.periode === 'GANJIL'
                                ? 'Ganjil'
                                : 'Genap'}
                              )
                            </SelectItem>
                          ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Tidak ada semester tersedia
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSemesterId && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Kelas <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={newAssignment.kelas}
                          onChange={(e) =>
                            handleNewAssignmentChange('kelas', e.target.value)
                          }
                          placeholder="A"
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Jadwal <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={newAssignment.jadwal}
                          onChange={(e) =>
                            handleNewAssignmentChange('jadwal', e.target.value)
                          }
                          placeholder="Senin, 08:00-10:00"
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Tanggal Jadwal (Opsional)
                        </Label>
                        <Input
                          type="date"
                          value={newAssignment.tanggalJadwal}
                          onChange={(e) =>
                            handleNewAssignmentChange(
                              'tanggalJadwal',
                              e.target.value
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Dosen <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={newAssignment.dosen}
                          onChange={(e) =>
                            handleNewAssignmentChange('dosen', e.target.value)
                          }
                          placeholder="Nama Dosen atau NIP"
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Kuota <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={newAssignment.kuota}
                          onChange={(e) =>
                            handleNewAssignmentChange(
                              'kuota',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="30"
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Biaya <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={newAssignment.biaya}
                          onChange={(e) =>
                            handleNewAssignmentChange(
                              'biaya',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Prasyarat</Label>
                        <Input
                          value={newAssignment.prasyarat}
                          onChange={(e) =>
                            handleNewAssignmentChange(
                              'prasyarat',
                              e.target.value
                            )
                          }
                          placeholder="Kode mata kuliah prasyarat"
                          className="h-8"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAssignment}
                      className="w-full sm:w-auto">
                      <i className="fa-solid fa-plus mr-2"></i>
                      Tambah Assignment
                    </Button>
                  </>
                )}
              </div>
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
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
