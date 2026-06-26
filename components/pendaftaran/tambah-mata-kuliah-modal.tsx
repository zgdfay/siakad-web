"use client";

import { useState } from "react";
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

interface TambahMataKuliahModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesterId: string;
  semesterName: string;
  onSuccess: () => void;
}

export function TambahMataKuliahModal({
  open,
  onOpenChange,
  semesterId,
  semesterName,
  onSuccess,
}: TambahMataKuliahModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    sks: "",
    prodi: "",
  });

  const prodiOptions = [
    "Teknik Informatika",
    "Sistem Informasi",
    "Teknik Elektro",
    "Teknik Mesin",
    "Teknik Sipil",
    "Manajemen",
    "Akuntansi",
    "Hukum",
    "Psikologi",
    "Lainnya",
  ];

  const resetForm = () => {
    setFormData({
      kode: "",
      nama: "",
      sks: "",
      prodi: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.kode.trim()) {
      toast.error("Kode mata kuliah wajib diisi");
      return;
    }
    if (!formData.nama.trim()) {
      toast.error("Nama mata kuliah wajib diisi");
      return;
    }
    if (!formData.sks || parseInt(formData.sks) < 1 || parseInt(formData.sks) > 6) {
      toast.error("SKS harus antara 1-6");
      return;
    }
    if (!formData.prodi) {
      toast.error("Program studi wajib dipilih");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/mata-kuliah/mahasiswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sks: parseInt(formData.sks),
          semesterId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat mata kuliah");
      }

      toast.success("Mata kuliah berhasil ditambahkan!", {
        description: `${formData.nama} telah ditambahkan ke ${semesterName}`,
      });

      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat mata kuliah");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background shadow-lg animate-in fade-in-0 zoom-in-95 flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="p-6 pb-4 pr-12 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <i className="fa-solid fa-plus text-primary"></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Tambah Mata Kuliah</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {semesterName}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info Banner */}
          <div className="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-300 px-4 py-3 rounded-lg flex items-start gap-3">
            <i className="fa-solid fa-circle-info mt-0.5 text-sm"></i>
            <p className="text-xs leading-relaxed">
              Tambahkan mata kuliah yang ingin Anda ambil di semester ini.
              Jadwal dan dosen akan dikonfirmasi oleh panitia setelah
              pendaftaran.
            </p>
          </div>

          {/* Kode Mata Kuliah */}
          <div className="space-y-2">
            <Label htmlFor="kode" className="text-sm font-medium">
              Kode Mata Kuliah <span className="text-destructive">*</span>
            </Label>
            <Input
              id="kode"
              placeholder="Contoh: IF1234"
              value={formData.kode}
              onChange={(e) =>
                setFormData({ ...formData, kode: e.target.value.toUpperCase() })
              }
              className="h-10"
              disabled={loading}
            />
          </div>

          {/* Nama Mata Kuliah */}
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-sm font-medium">
              Nama Mata Kuliah <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nama"
              placeholder="Contoh: Pemrograman Web Lanjut"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              className="h-10"
              disabled={loading}
            />
          </div>

          {/* SKS & Prodi */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sks" className="text-sm font-medium">
                SKS <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sks"
                type="number"
                min={1}
                max={6}
                placeholder="1-6"
                value={formData.sks}
                onChange={(e) =>
                  setFormData({ ...formData, sks: e.target.value })
                }
                className="h-10"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prodi" className="text-sm font-medium">
                Program Studi <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.prodi}
                onValueChange={(value) =>
                  setFormData({ ...formData, prodi: value })
                }
                disabled={loading}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih prodi" />
                </SelectTrigger>
                <SelectContent>
                  {prodiOptions.map((prodi) => (
                    <SelectItem key={prodi} value={prodi}>
                      {prodi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Biaya Info */}
          <div className="bg-muted/50 border border-border rounded-lg px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Biaya per Mata Kuliah</span>
              <span className="font-semibold text-primary">Rp 250.000</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-plus mr-2"></i>
                  Tambah Mata Kuliah
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
