"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface JadwalItem {
  id: string;
  pendaftaranDetailId: string;
  kode: string;
  nama: string;
  kelas: string;
  jadwal: string;
  tanggalJadwal?: string | Date | null;
  dosen: string;
  sks: number;
  statusJadwal: "AKTIF" | "SELESAI";
  semester: {
    nama: string;
    tahun: string;
    periode: string;
  };
}

type FilterStatus = "SEMUA" | "AKTIF" | "SELESAI";

export default function JadwalKuliahPage() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("SEMUA");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/pendaftaran/user/me");
        if (!response.ok) throw new Error("Gagal mengambil data jadwal");
        const data = await response.json();

        // Filter hanya pendaftaran yang DITERIMA
        const diterimaPendaftaran = (data.pendaftaran || []).filter(
          (p: any) => p.status === "DITERIMA",
        );

        // Extract jadwal dari semua pendaftaran yang diterima
        const allJadwal: JadwalItem[] = [];
        diterimaPendaftaran.forEach((pendaftaran: any) => {
          pendaftaran.detail.forEach((detail: any) => {
            // Hanya tampilkan jadwal yang sudah di-publish
            if (detail.semesterMataKuliah?.isPublished) {
              allJadwal.push({
                id: detail.semesterMataKuliah.id,
                pendaftaranDetailId: detail.id,
                kode: detail.semesterMataKuliah.mataKuliah.kode,
                nama: detail.semesterMataKuliah.mataKuliah.nama,
                kelas: detail.semesterMataKuliah.kelas,
                jadwal: detail.semesterMataKuliah.jadwal,
                tanggalJadwal: detail.semesterMataKuliah.tanggalJadwal || null,
                dosen: detail.semesterMataKuliah.dosen,
                sks: detail.semesterMataKuliah.mataKuliah.sks,
                statusJadwal: detail.statusJadwal || "AKTIF",
                semester: {
                  nama: pendaftaran.semester.nama,
                  tahun: pendaftaran.semester.tahun,
                  periode: pendaftaran.semester.periode,
                },
              });
            }
          });
        });

        setJadwal(allJadwal);
      } catch (error) {
        console.error("Error fetching jadwal:", error);
        toast.error("Gagal mengambil data jadwal");
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, []);

  const handleToggleStatus = async (
    pendaftaranDetailId: string,
    currentStatus: "AKTIF" | "SELESAI",
  ) => {
    const newStatus = currentStatus === "AKTIF" ? "SELESAI" : "AKTIF";
    setUpdatingIds((prev) => new Set(prev).add(pendaftaranDetailId));

    try {
      const response = await fetch(
        `/api/pendaftaran-detail/${pendaftaranDetailId}/status-jadwal`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusJadwal: newStatus }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memperbarui status jadwal");
      }

      // Update local state
      setJadwal((prev) =>
        prev.map((item) =>
          item.pendaftaranDetailId === pendaftaranDetailId
            ? { ...item, statusJadwal: newStatus }
            : item,
        ),
      );

      toast.success(
        newStatus === "SELESAI"
          ? "Jadwal ditandai sebagai selesai"
          : "Jadwal dikembalikan ke aktif",
      );
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Gagal memperbarui status jadwal");
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(pendaftaranDetailId);
        return newSet;
      });
    }
  };

  // Filter jadwal berdasarkan status
  const filteredJadwal =
    filterStatus === "SEMUA"
      ? jadwal
      : jadwal.filter((item) => item.statusJadwal === filterStatus);

  // Group by semester
  const jadwalBySemester = filteredJadwal.reduce(
    (acc, item) => {
      const key = item.semester.nama;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, JadwalItem[]>,
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Jadwal Kuliah
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Jadwal mata kuliah semester antara yang telah Anda daftarkan dan
              diterima
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={filterStatus}
              onValueChange={(value: FilterStatus) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEMUA">Semua</SelectItem>
                <SelectItem value="AKTIF">Aktif</SelectItem>
                <SelectItem value="SELESAI">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Memuat data jadwal...</p>
            </CardContent>
          </Card>
        ) : Object.keys(jadwalBySemester).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-calendar-xmark text-2xl text-muted-foreground"></i>
              </div>
              <p className="text-muted-foreground mb-2">
                Belum ada jadwal kuliah
              </p>
              <p className="text-sm text-muted-foreground">
                Jadwal akan muncul setelah pendaftaran Anda diterima oleh admin
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(jadwalBySemester).map(([semesterNama, items]) => (
            <Card key={semesterNama}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{semesterNama}</CardTitle>
                    <CardDescription>
                      {items.length} mata kuliah -{" "}
                      {items.reduce((sum, item) => sum + item.sks, 0)} SKS
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {items[0].semester.tahun} -{" "}
                    {items[0].semester.periode === "GANJIL"
                      ? "Ganjil"
                      : "Genap"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Kode</TableHead>
                        <TableHead className="text-center">
                          Mata Kuliah
                        </TableHead>
                        <TableHead className="text-center">Kelas</TableHead>
                        <TableHead className="text-center">Jadwal</TableHead>
                        <TableHead className="text-center">Tanggal</TableHead>
                        <TableHead className="text-center">Dosen</TableHead>
                        <TableHead className="text-center">SKS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const formatTanggal = (
                          tanggal: string | Date | null | undefined,
                        ) => {
                          if (!tanggal) return "-";
                          try {
                            const date = new Date(tanggal);
                            return date.toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            });
                          } catch {
                            return "-";
                          }
                        };

                        const isUpdating = updatingIds.has(
                          item.pendaftaranDetailId,
                        );
                        const isSelesai = item.statusJadwal === "SELESAI";

                        return (
                          <TableRow
                            key={item.id}
                            className={
                              isSelesai ? "opacity-60 bg-muted/30" : ""
                            }
                          >
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleToggleStatus(
                                    item.pendaftaranDetailId,
                                    item.statusJadwal,
                                  )
                                }
                                disabled={isUpdating}
                                className="h-8 w-8 p-0"
                              >
                                {isUpdating ? (
                                  <i className="fa-solid fa-spinner fa-spin text-muted-foreground"></i>
                                ) : isSelesai ? (
                                  <i className="fa-solid fa-check-circle text-green-600 dark:text-green-400"></i>
                                ) : (
                                  <i className="fa-regular fa-circle text-muted-foreground hover:text-primary"></i>
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium text-center">
                              {item.kode}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.nama}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{item.kelas}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-medium">
                                {item.jadwal || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm text-muted-foreground">
                                {formatTanggal(item.tanggalJadwal)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {item.dosen || "-"}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.sks}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
