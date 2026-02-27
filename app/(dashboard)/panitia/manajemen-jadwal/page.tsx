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
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  JadwalFormDialog,
  JadwalFormValues,
} from "@/components/panitia/jadwal-form-dialog";

interface JadwalItem {
  id: string;
  mataKuliahId: string;
  kode: string;
  nama: string;
  kelas: string;
  jadwal: string;
  tanggalJadwal?: string | Date | null;
  dosen: string;
  sks: number;
  kuota: number;
  terdaftar: number;
  isPublished: boolean;
  prasyarat?: string | null;
  semester: {
    id: string;
    nama: string;
    tahun: string;
    periode: string;
  };
}

interface JadwalStats {
  total: number;
  published: number;
  draft: number;
}

export default function ManajemenJadwalPage() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [stats, setStats] = useState<JadwalStats>({
    total: 0,
    published: 0,
    draft: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [semesters, setSemesters] = useState<
    Array<{ id: string; nama: string }>
  >([]);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalItem | null>(null);

  useEffect(() => {
    fetchSemesters();
    fetchJadwal();
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [statusFilter, semesterFilter]);

  const fetchSemesters = async () => {
    try {
      const response = await fetch("/api/semesters");
      if (!response.ok) throw new Error("Gagal mengambil data semester");
      const data = await response.json();
      setSemesters(data.semesters || []);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("isPublished", statusFilter);
      }
      if (semesterFilter !== "all") {
        params.append("semesterId", semesterFilter);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/admin/jadwal?${params.toString()}`);
      if (!response.ok) throw new Error("Gagal mengambil data jadwal");
      const data = await response.json();

      setJadwal(data.jadwal || []);
      setStats(data.stats || { total: 0, published: 0, draft: 0 });
    } catch (error) {
      console.error("Error fetching jadwal:", error);
      toast.error("Gagal mengambil data jadwal");
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;

      // Optimitic update
      setJadwal((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isPublished: newStatus } : item,
        ),
      );
      setStats((prev) => ({
        ...prev,
        published: newStatus ? prev.published + 1 : prev.published - 1,
        draft: newStatus ? prev.draft - 1 : prev.draft + 1,
      }));

      const res = await fetch("/api/admin/jadwal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPublished: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status publikasi");

      const data = await res.json();
      toast.success(data.message);
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error("Gagal mengubah status publikasi");
      fetchJadwal(); // revert optimistic update
    }
  };

  const handleSubmitJadwal = async (
    values: JadwalFormValues & { id?: string },
  ) => {
    try {
      const isEditing = !!values.id;
      const response = await fetch("/api/admin/jadwal", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error ||
            `Gagal ${isEditing ? "memperbarui" : "membuat"} jadwal kelas`,
        );
      }

      toast.success(
        `Jadwal kelas berhasil ${isEditing ? "diperbarui" : "dibuat"}`,
      );
      setFormDialogOpen(false);
      setSelectedJadwal(null);
      fetchJadwal();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    }
  };

  const openCreateDialog = () => {
    setSelectedJadwal(null);
    setFormDialogOpen(true);
  };

  const openEditDialog = (item: JadwalItem) => {
    setSelectedJadwal(item);
    setFormDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/jadwal?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus jadwal");

      toast.success(data.message);
      fetchJadwal();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJadwal();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const formatTanggal = (tanggal: string | Date | null | undefined) => {
    if (!tanggal) return "-";
    try {
      const date = new Date(tanggal);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // Group by semester
  const jadwalBySemester = jadwal.reduce(
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
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Manajemen Jadwal
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Atur publikasi dan lihat master jadwal kuliah
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <i className="fa-solid fa-plus mr-2"></i> Tambah Jadwal Kelas
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Jadwal Kelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jadwal Dipublish
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.published}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jadwal Draft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {stats.draft}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cari</label>
                <Input
                  placeholder="Cari kode, nama MK, atau dosen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Publikasi</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="true">Published</SelectItem>
                    <SelectItem value="false">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <Select
                  value={semesterFilter}
                  onValueChange={setSemesterFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Semester</SelectItem>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jadwal Table */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Memuat jadwal...</p>
            </CardContent>
          </Card>
        ) : Object.keys(jadwalBySemester).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-calendar-xmark text-2xl text-muted-foreground"></i>
              </div>
              <p className="text-muted-foreground mb-2">
                Tidak ada jadwal ditemukan
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
                      {items.length} kelas -{" "}
                      {items.reduce((sum, item) => sum + item.sks, 0)} SKS total
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
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px] text-center whitespace-nowrap">
                            Publish
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            Kode
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Mata Kuliah
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            Kelas
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Dosen
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            SKS
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            Jadwal
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            Tanggal
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">
                            Terisi
                          </TableHead>
                          <TableHead className="text-right whitespace-nowrap">
                            Aksi
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                <Switch
                                  checked={item.isPublished}
                                  onCheckedChange={() =>
                                    togglePublish(item.id, item.isPublished)
                                  }
                                />
                                <span
                                  className={`text-[10px] font-medium ${item.isPublished ? "text-green-600" : "text-amber-600"}`}
                                >
                                  {item.isPublished ? "PUBLISHED" : "DRAFT"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-center whitespace-nowrap">
                              {item.kode}
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-medium">
                              {item.nama}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              <Badge variant="outline">{item.kelas}</Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {item.dosen || "-"}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              {item.sks}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              <span className="font-medium">
                                {item.jadwal || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              <span className="text-sm text-muted-foreground">
                                {formatTanggal(item.tanggalJadwal)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              <span className="font-medium">
                                {item.terdaftar}
                              </span>
                              <span className="text-muted-foreground text-xs ml-1">
                                / {item.kuota}
                              </span>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap pr-4">
                              <div className="flex justify-end items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(item)}
                                  className="text-primary hover:text-primary/90 hover:bg-primary/10"
                                >
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    >
                                      <i className="fa-solid fa-trash"></i>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Hapus Jadwal Kelas?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tindakan ini tidak dapat dibatalkan.
                                        Kelas yang sudah ada mahasiswa terdaftar
                                        tidak bisa dihapus secara permanen.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Batal
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-destructive hover:bg-destructive/90 text-white"
                                      >
                                        Ya, Hapus
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <JadwalFormDialog
        open={formDialogOpen}
        onOpenChange={(op) => {
          setFormDialogOpen(op);
          if (!op) setSelectedJadwal(null);
        }}
        onSubmit={handleSubmitJadwal}
        initialData={
          selectedJadwal
            ? {
                id: selectedJadwal.id,
                semesterId: selectedJadwal.semester.id,
                mataKuliahId: selectedJadwal.mataKuliahId,
                kelas: selectedJadwal.kelas,
                jadwal: selectedJadwal.jadwal,
                tanggalJadwal: selectedJadwal.tanggalJadwal
                  ? typeof selectedJadwal.tanggalJadwal === "string"
                    ? selectedJadwal.tanggalJadwal.split("T")[0]
                    : new Date(selectedJadwal.tanggalJadwal)
                        .toISOString()
                        .split("T")[0]
                  : "",
                dosen: selectedJadwal.dosen,
                kuota: selectedJadwal.kuota,
                prasyarat: selectedJadwal.prasyarat || "",
              }
            : null
        }
      />
    </div>
  );
}
