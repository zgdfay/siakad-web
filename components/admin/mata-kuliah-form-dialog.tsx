"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface MataKuliahFormValues {
  id?: string;
  kode: string;
  nama: string;
  sks: number;
  prodi: string;
  kategori: "WAJIB" | "PILIHAN";
  status?: "AKTIF" | "NONAKTIF";
  deskripsi?: string;
  biaya?: number;
  semesterId?: string;
}

interface SemesterOption {
  id: string;
  nama: string;
  tahun: string;
  periode: string;
}

interface DosenOption {
  id: string;
  name: string;
}

interface MataKuliahFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
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
    kode: "",
    nama: "",
    sks: 3,
    prodi: "",
    kategori: "WAJIB",
    status: "AKTIF",
    deskripsi: "",
    biaya: 0,
    semesterId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  // Reset form values when mode changes
  // Fetch semesters when dialog opens
  useEffect(() => {
    if (open) {
      const fetchSemesters = async () => {
        try {
          setLoadingSemesters(true);
          const res = await fetch("/api/semesters");
          if (res.ok) {
            const data = await res.json();
            setSemesters(
              (data.semesters || []).map((s: any) => ({
                id: s.id,
                nama: s.nama,
                tahun: s.tahun,
                periode: s.periode,
              })),
            );
          }
        } catch (error) {
          console.error("Failed to fetch semesters:", error);
        } finally {
          setLoadingSemesters(false);
        }
      };
      fetchSemesters();
    } else {
      setFormValues({
        id: undefined,
        kode: "",
        nama: "",
        sks: 3,
        prodi: "",
        kategori: "WAJIB",
        status: "AKTIF",
        deskripsi: "",
        biaya: 0,
        semesterId: "",
      });
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormValues({
        ...initialData,
      });
    } else if (mode === "create") {
      setFormValues({
        id: undefined,
        kode: "",
        nama: "",
        sks: 3,
        prodi: "",
        kategori: "WAJIB",
        status: "AKTIF",
        deskripsi: "",
        biaya: 0,
        semesterId: "",
      });
    }
  }, [mode, initialData, open]);

  const handleChange = (
    field: keyof MataKuliahFormValues,
    value: string | number,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formValues.kode ||
      !formValues.nama ||
      !formValues.prodi ||
      !formValues.semesterId
    ) {
      console.warn("Form validation failed: missing required fields");
      return;
    }

    console.log("Submitting form with values:", formValues);
    setIsSubmitting(true);
    try {
      await onSubmit(formValues);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
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
    !formValues.status;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Main Content */}
      <div className="relative z-50 w-[95vw] max-w-5xl max-h-[90vh] rounded-lg border bg-background shadow-lg flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-background/80 backdrop-blur-sm p-2"
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Header - Fixed */}
        <div className="p-6 pb-4 pr-12 border-b shrink-0">
          <h2 className="text-xl font-semibold">
            {mode === "create" ? "Tambah Mata Kuliah" : "Edit Mata Kuliah"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "create"
              ? "Isi data mata kuliah dengan lengkap."
              : "Perbarui informasi mata kuliah sesuai kebutuhan."}
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
                    handleChange("kode", e.target.value.toUpperCase())
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
                    handleChange("sks", parseInt(e.target.value) || 0)
                  }
                  placeholder="3"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biaya">Biaya (Opsional)</Label>
                <Input
                  id="biaya"
                  type="number"
                  min="0"
                  value={formValues.biaya}
                  onChange={(e) =>
                    handleChange("biaya", parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
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
                onChange={(e) => handleChange("nama", e.target.value)}
                placeholder="Masukkan nama mata kuliah"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semesterId">
                Semester <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formValues.semesterId}
                onValueChange={(value) => handleChange("semesterId", value)}
                disabled={loadingSemesters}
              >
                <SelectTrigger id="semesterId" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingSemesters ? "Memuat semester..." : "Pilih Semester"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nama} ({s.tahun} -{" "}
                      {s.periode === "GANJIL" ? "Ganjil" : "Genap"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prodi">
                  Program Studi <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prodi"
                  value={formValues.prodi}
                  onChange={(e) => handleChange("prodi", e.target.value)}
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
                  onValueChange={(value: "WAJIB" | "PILIHAN") =>
                    handleChange("kategori", value)
                  }
                >
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
                  onValueChange={(value: "AKTIF" | "NONAKTIF") =>
                    handleChange("status", value)
                  }
                >
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
                value={formValues.deskripsi || ""}
                onChange={(e) => handleChange("deskripsi", e.target.value)}
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
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isFormIncomplete || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Menyimpan...
              </>
            ) : mode === "create" ? (
              "Simpan Mata Kuliah"
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
