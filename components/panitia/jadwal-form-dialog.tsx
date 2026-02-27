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

export interface JadwalFormValues {
  semesterId: string;
  mataKuliahId: string;
  kelas: string;
  jadwal: string;
  tanggalJadwal: string;
  dosen: string;
  kuota: number;
  prasyarat: string;
}

interface OptionItem {
  id: string;
  nama: string;
  info?: string;
}

interface JadwalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: JadwalFormValues & { id?: string }) => void;
  initialData?: (JadwalFormValues & { id: string }) | null;
}

export function JadwalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: JadwalFormDialogProps) {
  const [formValues, setFormValues] = useState<JadwalFormValues>({
    semesterId: "",
    mataKuliahId: "",
    kelas: "A",
    jadwal: "",
    tanggalJadwal: "",
    dosen: "",
    kuota: 30,
    prasyarat: "",
  });

  const [semesters, setSemesters] = useState<OptionItem[]>([]);
  const [mataKuliahs, setMataKuliahs] = useState<OptionItem[]>([]);
  const [dosens, setDosens] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchOptions();
      if (initialData) {
        setFormValues({
          semesterId: initialData.semesterId,
          mataKuliahId: initialData.mataKuliahId,
          kelas: initialData.kelas,
          jadwal: initialData.jadwal,
          tanggalJadwal: initialData.tanggalJadwal || "",
          dosen: initialData.dosen,
          kuota: initialData.kuota,
          prasyarat: initialData.prasyarat || "",
        });
      } else {
        setFormValues({
          semesterId: "",
          mataKuliahId: "",
          kelas: "A",
          jadwal: "",
          tanggalJadwal: "",
          dosen: "",
          kuota: 30,
          prasyarat: "",
        });
      }
    }
  }, [open, initialData]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const [resSem, resMk, resDosen] = await Promise.all([
        fetch("/api/semesters"),
        fetch("/api/mata-kuliah?status=AKTIF"),
        fetch("/api/users?role=DOSEN"),
      ]);

      if (resSem.ok) {
        const data = await resSem.json();
        setSemesters(
          (data.semesters || []).map((s: any) => ({
            id: s.id,
            nama: `${s.nama} (${s.tahun} - ${s.periode === "GANJIL" ? "Ganjil" : "Genap"})`,
          })),
        );
      }

      if (resMk.ok) {
        const data = await resMk.json();
        setMataKuliahs(
          (data.mataKuliah || []).map((m: any) => ({
            id: m.id,
            nama: `${m.kode} - ${m.nama} (${m.sks} SKS)`,
          })),
        );
      }

      if (resDosen.ok) {
        const data = await resDosen.json();
        setDosens(
          (data.users || []).map((d: any) => ({
            id: d.id,
            nama: d.name,
          })),
        );
      }
    } catch (error) {
      console.error("Failed fetching options", error);
      toast.error("Gagal mengambil data referensi");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof JadwalFormValues,
    value: string | number,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formValues.semesterId ||
      !formValues.mataKuliahId ||
      !formValues.kelas.trim() ||
      !formValues.jadwal.trim() ||
      !formValues.dosen.trim() ||
      !formValues.kuota
    ) {
      toast.error("Form tidak lengkap");
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await onSubmit({ ...formValues, id: initialData.id });
      } else {
        await onSubmit(formValues);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormIncomplete =
    !formValues.semesterId ||
    !formValues.mataKuliahId ||
    !formValues.kelas.trim() ||
    !formValues.jadwal.trim() ||
    !formValues.dosen.trim() ||
    !formValues.kuota ||
    formValues.kuota < 1;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Main Content */}
      <div className="relative z-50 w-[95vw] max-w-4xl max-h-[90vh] rounded-lg border bg-background shadow-lg flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 p-2"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        <div className="p-6 pb-4 border-b shrink-0 pr-12">
          <h2 className="text-xl font-semibold">
            {initialData ? "Edit Jadwal Kelas" : "Buat Jadwal Kelas"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {initialData
              ? "Ubah detail jadwal kelas yang sudah ada."
              : "Tambah jadwal kelas baru ke sebuah semester."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 min-h-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Semester <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formValues.semesterId}
                onValueChange={(val) => handleChange("semesterId", val)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Mata Kuliah Dasar <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formValues.mataKuliahId}
                onValueChange={(val) => handleChange("mataKuliahId", val)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Mata Kuliah" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {mataKuliahs.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                Kelas <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formValues.kelas}
                onChange={(e) => handleChange("kelas", e.target.value)}
                placeholder="A / 01"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Jadwal / Waktu <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formValues.jadwal}
                onChange={(e) => handleChange("jadwal", e.target.value)}
                placeholder="Senin, 08:00 - 10:00"
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal (Opsional)</Label>
              <Input
                type="date"
                value={formValues.tanggalJadwal}
                onChange={(e) => handleChange("tanggalJadwal", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Dosen Pengajar <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formValues.dosen}
                onValueChange={(val) => handleChange("dosen", val)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Dosen" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {dosens.map((d) => (
                    <SelectItem key={d.id} value={d.nama}>
                      {d.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-2">
                <Label>
                  Kuota <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formValues.kuota}
                  onChange={(e) =>
                    handleChange("kuota", parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prasyarat (Opsional)</Label>
            <Input
              value={formValues.prasyarat}
              onChange={(e) => handleChange("prasyarat", e.target.value)}
              placeholder="Contoh: MK001 / Lulusan T.Informatika"
            />
          </div>
        </div>

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
            ) : initialData ? (
              "Simpan Perubahan"
            ) : (
              "Simpan Jadwal"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
