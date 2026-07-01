"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PRODI_OPTIONS } from "@/lib/constants";

interface MasterMataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  prodi: string;
  kategori: string;
  biaya: number;
}

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
  const [mode, setMode] = useState<"select" | "manual">("select");
  const [loading, setLoading] = useState(false);
  const [fetchingKatalog, setFetchingKatalog] = useState(false);

  // Katalog state
  const [katalogList, setKatalogList] = useState<MasterMataKuliah[]>([]);
  const [existingKodes, setExistingKodes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [prodiFilter, setProdiFilter] = useState("SEMUA");
  const [selectedMk, setSelectedMk] = useState<MasterMataKuliah | null>(null);

  // Manual form state
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    sks: "",
    prodi: "",
  });

  const prodiOptions = PRODI_OPTIONS;

  const resetState = () => {
    setMode("select");
    setSelectedMk(null);
    setSearchQuery("");
    setProdiFilter("SEMUA");
    setFormData({
      kode: "",
      nama: "",
      sks: "",
      prodi: "",
    });
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  // Fetch katalog & existing mata kuliah on open
  useEffect(() => {
    if (open && semesterId) {
      const loadData = async () => {
        try {
          setFetchingKatalog(true);
          const [katalogRes, existingRes] = await Promise.all([
            fetch("/api/mata-kuliah?status=AKTIF"),
            fetch(`/api/semesters/${semesterId}/mata-kuliah`),
          ]);

          if (katalogRes.ok) {
            const data = await katalogRes.json();
            setKatalogList(data.mataKuliah || []);
          }

          if (existingRes.ok) {
            const data = await existingRes.json();
            const existing = (data.mataKuliah || []).map(
              (smk: any) => smk.mataKuliah?.kode || ""
            );
            setExistingKodes(existing);
          }
        } catch (error) {
          console.error("Gagal memuat katalog mata kuliah:", error);
        } finally {
          setFetchingKatalog(false);
        }
      };
      loadData();
    }
  }, [open, semesterId]);

  // Filtered katalog
  const filteredKatalog = katalogList.filter((mk) => {
    // Exclude if already in semester
    if (existingKodes.includes(mk.kode)) return false;

    // Search filter
    const matchesSearch =
      mk.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mk.nama.toLowerCase().includes(searchQuery.toLowerCase());

    // Prodi filter
    const matchesProdi =
      prodiFilter === "SEMUA" ||
      mk.prodi.toLowerCase() === prodiFilter.toLowerCase();

    return matchesSearch && matchesProdi;
  });

  const handleSubmitSelect = async () => {
    if (!selectedMk) {
      toast.error("Pilih salah satu mata kuliah terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/mata-kuliah/mahasiswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mataKuliahId: selectedMk.id,
          kode: selectedMk.kode,
          nama: selectedMk.nama,
          sks: selectedMk.sks,
          prodi: selectedMk.prodi,
          semesterId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menambahkan mata kuliah");

      toast.success("Mata kuliah berhasil ditambahkan!", {
        description: `${selectedMk.kode} - ${selectedMk.nama} ditambahkan ke ${semesterName}`,
      });

      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan mata kuliah");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();

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
      if (!response.ok) throw new Error(data.error || "Gagal membuat mata kuliah");

      toast.success("Mata kuliah berhasil diajukan & ditambahkan!", {
        description: `${formData.nama} telah ditambahkan ke ${semesterName}`,
      });

      handleClose();
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
      <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-xl translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background shadow-lg animate-in fade-in-0 zoom-in-95 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="p-6 pb-4 pr-12 border-b shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <i className={mode === "select" ? "fa-solid fa-list-check text-primary text-lg" : "fa-solid fa-pen-to-square text-primary text-lg"}></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {mode === "select" ? "Pilih dari Katalog Mata Kuliah" : "Ajukan Mata Kuliah Baru"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {semesterName}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {mode === "select" ? (
            /* ================= MODE: PILIH DARI KATALOG ================= */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-300 px-4 py-3 rounded-lg flex items-start gap-3">
                <i className="fa-solid fa-circle-info mt-0.5 text-sm shrink-0"></i>
                <p className="text-xs leading-relaxed">
                  Pilih mata kuliah dari kurikulum resmi kampus yang belum tersedia di semester antara ini. Kode, SKS, dan Prodi akan terisi otomatis.
                </p>
              </div>

              {/* Search & Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-muted-foreground text-sm"></i>
                  <Input
                    placeholder="Cari kode atau nama matkul..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 text-sm"
                  />
                </div>
                <div>
                  <Select value={prodiFilter} onValueChange={setProdiFilter}>
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Filter Prodi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEMUA">Semua Prodi</SelectItem>
                      {prodiOptions.map((prodi) => (
                        <SelectItem key={prodi} value={prodi}>
                          {prodi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Katalog List */}
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto bg-card">
                {fetchingKatalog ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Memuat katalog kampus...
                  </div>
                ) : filteredKatalog.length === 0 ? (
                  <div className="py-10 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                      <i className="fa-solid fa-folder-open"></i>
                    </div>
                    <p className="text-sm font-medium text-foreground">Mata kuliah tidak ditemukan</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      {searchQuery
                        ? `Tidak ada hasil untuk "${searchQuery}". Pastikan matkul belum diambil di semester ini.`
                        : "Semua mata kuliah aktif sudah masuk di semester antara ini."}
                    </p>
                  </div>
                ) : (
                  filteredKatalog.map((mk) => {
                    const isSelected = selectedMk?.id === mk.id;
                    return (
                      <div
                        key={mk.id}
                        onClick={() => setSelectedMk(isSelected ? null : mk)}
                        className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between gap-3 ${isSelected
                          ? "bg-primary/10 border-l-4 border-l-primary"
                          : "hover:bg-muted/50"
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-sm text-foreground">
                              {mk.kode}
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5">
                              {mk.sks} SKS
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] h-5">
                              {mk.prodi}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground font-medium truncate">
                            {mk.nama}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center border ${isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/30 text-transparent"
                              }`}
                          >
                            <i className="fa-solid fa-check text-xs"></i>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Preview & Submit */}
              <div className="pt-2 border-t space-y-3">
                {selectedMk ? (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between text-sm">
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="text-xs text-muted-foreground block">Mata Kuliah Terpilih:</span>
                      <strong className="font-bold text-primary">{selectedMk.kode}</strong> - <span className="truncate">{selectedMk.nama}</span> ({selectedMk.sks} SKS)
                    </div>
                    <Button
                      onClick={handleSubmitSelect}
                      disabled={loading}
                      size="sm"
                      className="shrink-0 ml-3"
                    >
                      {loading ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : (
                        <>
                          <i className="fa-solid fa-plus mr-1.5"></i>
                          Tambahkan
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button disabled className="w-full" size="lg">
                    Pilih Mata Kuliah dari Daftar di Atas
                  </Button>
                )}

                {/* Footer link to switch mode */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMk(null);
                      setMode("manual");
                    }}
                    className="text-xs text-muted-foreground inline-flex items-center gap-1.5"
                  >
                    <span>Mata kuliah yang dicari tidak ada di katalog?</span>
                    <strong className="font-semibold text-primary hover:underline cursor-pointer">Input manual matkul baru &rarr;</strong>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= MODE: INPUT MANUAL ================= */
            <form onSubmit={handleSubmitManual} className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setMode("select")}
                  className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  Kembali ke Daftar Katalog Resmi
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-300 px-4 py-3 rounded-lg flex items-start gap-3">
                <i className="fa-solid fa-circle-exclamation mt-0.5 text-sm shrink-0"></i>
                <p className="text-xs leading-relaxed">
                  Gunakan form ini hanya jika mata kuliah yang Anda butuhkan <strong>belum tercatat sama sekali</strong> di katalog resmi kampus.
                </p>
              </div>

              {/* Kode Mata Kuliah */}
              <div className="space-y-1.5">
                <Label htmlFor="kode" className="text-xs font-semibold uppercase text-muted-foreground">
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
              <div className="space-y-1.5">
                <Label htmlFor="nama" className="text-xs font-semibold uppercase text-muted-foreground">
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
                <div className="space-y-1.5">
                  <Label htmlFor="sks" className="text-xs font-semibold uppercase text-muted-foreground">
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
                <div className="space-y-1.5">
                  <Label htmlFor="prodi" className="text-xs font-semibold uppercase text-muted-foreground">
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
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Biaya per Mata Kuliah</span>
                  <span className="font-bold text-primary text-sm">Rp 250.000</span>
                </div>
              </div>

              {/* Submit Manual */}
              <div className="flex gap-3 pt-3 border-t">
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
                      Ajukan Matkul Baru
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
