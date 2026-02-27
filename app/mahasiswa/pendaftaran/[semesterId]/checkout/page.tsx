"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

// Mock data - akan diganti dengan data dari API
const mockMataKuliah = [
  {
    id: "mk1",
    kode: "MK001",
    nama: "Pemrograman Web",
    sks: 3,
    biaya: 500000,
  },
  {
    id: "mk2",
    kode: "MK002",
    nama: "Basis Data",
    sks: 3,
    biaya: 500000,
  },
  {
    id: "mk3",
    kode: "MK003",
    nama: "Jaringan Komputer",
    sks: 3,
    biaya: 500000,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const semesterId = params.semesterId as string;
  const [selectedMataKuliah, setSelectedMataKuliah] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [khsFile, setKhsFile] = useState<File | null>(null);

  const [checkoutData, setCheckoutData] = useState<{
    semesterId: string;
    mataKuliah: Array<{
      id: string;
      kode: string;
      nama: string;
      sks: number;
      biaya: number;
    }>;
    totalBiaya: number;
  } | null>(null);

  useEffect(() => {
    // Ambil dari session storage (dari halaman pendaftaran baru)
    const saved = sessionStorage.getItem("checkoutData");
    if (saved) {
      const data = JSON.parse(saved);
      setCheckoutData(data);
      setSelectedMataKuliah(data.mataKuliah.map((mk: { id: string }) => mk.id));
    } else {
      // Fallback ke method lama untuk kompatibilitas
      const savedOld = sessionStorage.getItem("selectedMataKuliah");
      if (savedOld) {
        setSelectedMataKuliah(JSON.parse(savedOld));
      } else {
        toast.error("Data tidak ditemukan", {
          description: "Silakan pilih mata kuliah terlebih dahulu",
        });
        router.push("/mahasiswa/pendaftaran");
      }
    }
  }, [semesterId, router]);

  const selectedMK = checkoutData
    ? checkoutData.mataKuliah
    : mockMataKuliah.filter((mk) => selectedMataKuliah.includes(mk.id));
  const totalSKS = selectedMK.reduce((sum, mk) => sum + mk.sks, 0);
  const totalBiaya = checkoutData
    ? checkoutData.totalBiaya
    : selectedMK.reduce((sum, mk) => sum + mk.biaya, 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Submit pendaftaran ke API
      const response = await fetch("/api/pendaftaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semesterId,
          mataKuliahIds: selectedMK.map((mk) => mk.id),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Handle error dengan detail yang lebih jelas
        if (response.status === 409 && data.overlappingMataKuliah) {
          throw new Error(
            data.detail ||
              `Anda sudah memiliki pendaftaran yang diterima untuk: ${data.overlappingMataKuliah}`,
          );
        }
        throw new Error(data.error || "Gagal membuat pendaftaran");
      }

      const result = await response.json();
      const pendaftaranId = result.pendaftaran.id;

      // Upload KHS file if provided
      if (khsFile) {
        const formData = new FormData();
        formData.append("pendaftaranId", pendaftaranId);
        formData.append("file", khsFile);

        const khsResponse = await fetch("/api/pendaftaran/upload-khs", {
          method: "POST",
          body: formData,
        });

        if (!khsResponse.ok) {
          throw new Error(
            "Pendaftaran berhasil, tetapi gagal mengupload KHS. Silakan upload menyusul atau hubungi Panitia.",
          );
        }
      }

      toast.success("Pendaftaran berhasil dibuat", {
        description: "Silakan lanjutkan ke halaman pembayaran",
      });

      // Simpan pendaftaran ID untuk halaman pembayaran
      sessionStorage.setItem("pendaftaranId", pendaftaranId);
      sessionStorage.setItem(
        "checkoutData",
        JSON.stringify({
          pendaftaranId,
          semesterId,
          mataKuliah: selectedMK,
          totalBiaya,
        }),
      );

      router.push(`/mahasiswa/pendaftaran/${semesterId}/pembayaran`);
    } catch (error: any) {
      // Tampilkan toast dengan pesan yang lebih jelas
      const errorMessage =
        error.message || "Terjadi kesalahan saat menyimpan data";

      // Jika error tentang mata kuliah yang sudah terdaftar
      if (errorMessage.includes("sudah memiliki pendaftaran yang diterima")) {
        toast.error("Mata Kuliah Sudah Terdaftar", {
          description: errorMessage,
          duration: 6000, // Tampilkan lebih lama agar user sempat membaca
        });
      } else {
        toast.error("Gagal Membuat Pendaftaran", {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (selectedMataKuliah.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Review Pendaftaran
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Periksa kembali data pendaftaran Anda sebelum melanjutkan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detail Pendaftaran */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mata Kuliah yang Dipilih</CardTitle>
                <CardDescription>
                  {selectedMK.length} mata kuliah - {totalSKS} SKS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">
                            Kode
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Nama Mata Kuliah
                          </TableHead>
                          <TableHead className="text-right whitespace-nowrap">
                            SKS
                          </TableHead>
                          <TableHead className="text-right whitespace-nowrap">
                            Biaya
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedMK.map((mk) => (
                          <TableRow key={mk.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {mk.kode}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {mk.nama}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {mk.sks}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(mk.biaya)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informasi Penting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-info-circle text-primary mt-0.5"></i>
                  <p className="text-muted-foreground">
                    Setelah pembayaran berhasil, pendaftaran Anda akan
                    diverifikasi oleh admin akademik.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-clock text-primary mt-0.5"></i>
                  <p className="text-muted-foreground">
                    Proses verifikasi membutuhkan waktu 1-3 hari kerja.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-file-invoice text-primary mt-0.5"></i>
                  <p className="text-muted-foreground">
                    SPK akan dikirimkan melalui email setelah verifikasi
                    berhasil.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Persyaratan Pendaftaran (KHS)</CardTitle>
                <CardDescription>
                  Upload Kartu Hasil Studi (KHS) terakhir untuk verifikasi
                  kelayakan mengikuti Semester Antara.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="khsFile">
                    Upload File KHS (JPG, PNG, PDF)
                  </Label>
                  <Input
                    id="khsFile"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setKhsFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal ukuran file: 5MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary & Payment */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total SKS</span>
                    <span className="font-medium">{totalSKS} SKS</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total Mata Kuliah
                    </span>
                    <span className="font-medium">{selectedMK.length}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Biaya</span>
                      <span className="text-xl font-bold text-primary">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(totalBiaya)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !khsFile}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Memproses...
                    </>
                  ) : (
                    "Lanjutkan ke Pembayaran"
                  )}
                </Button>

                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  disabled={loading}
                  className="w-full"
                >
                  <i className="fa-solid fa-arrow-left mr-2"></i>
                  Kembali
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
