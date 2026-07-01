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
import { toast } from "sonner";
import { PRODI_OPTIONS } from "@/lib/constants";

export interface MataKuliahEditValues {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  prodi: string;
  kategori: "WAJIB" | "PILIHAN";
  status: "AKTIF" | "NONAKTIF";
  deskripsi?: string | null;
  biaya?: number;
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
    id: "",
    kode: "",
    nama: "",
    sks: 3,
    prodi: "",
    kategori: "WAJIB",
    status: "AKTIF",
    deskripsi: "",
    biaya: 0,
  });
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch mata kuliah data
  useEffect(() => {
    if (open && mataKuliahId) {
      fetchMataKuliahData();
    } else if (!open) {
      // Reset form when closed
      setFormValues({
        id: "",
        kode: "",
        nama: "",
        sks: 3,
        prodi: "",
        kategori: "WAJIB",
        status: "AKTIF",
        deskripsi: "",
        biaya: 0,
      });
      setIsSubmitting(false);
    }
  }, [open, mataKuliahId]);

  const fetchMataKuliahData = async () => {
    if (!mataKuliahId) return;

    try {
      setLoadingData(true);
      const response = await fetch(`/api/mata-kuliah/${mataKuliahId}`);
      if (!response.ok) throw new Error("Gagal mengambil data mata kuliah");
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
        deskripsi: data.mataKuliah.deskripsi || "",
        biaya: data.mataKuliah.biaya || 0,
      };

      setFormValues(transformedData);
    } catch (error) {
      console.error("Error fetching mata kuliah data:", error);
      toast.error("Gagal mengambil data mata kuliah");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    field: keyof MataKuliahEditValues,
    value: string | number,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formValues.kode.trim() ||
      !formValues.nama.trim() ||
      !formValues.prodi.trim()
    ) {
      toast.error("Lengkapi semua field yang wajib diisi");
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prodi">
                  Program Studi <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formValues.prodi}
                  onValueChange={(value) => handleChange("prodi", value)}
                >
                  <SelectTrigger id="prodi" className="w-full">
                    <SelectValue placeholder="Pilih Program Studi" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODI_OPTIONS.map((prodi) => (
                      <SelectItem key={prodi} value={prodi}>
                        {prodi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
