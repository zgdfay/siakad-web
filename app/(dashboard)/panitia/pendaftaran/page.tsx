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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { DetailPendaftaranModal } from "@/components/pendaftaran/detail-pendaftaran-modal";

interface PendaftaranItem {
  id: string;
  userMaster: {
    id: string;
    nimOrNip: string;
    name: string;
  };
  semester: {
    id: string;
    nama: string;
    tahun: string;
    periode: string;
  };
  totalSKS: number;
  totalBiaya: number;
  status: "MENUNGGU_VERIFIKASI" | "DITERIMA" | "DITOLAK" | "DIBATALKAN";
  catatanAdmin?: string | null;
  createdAt: string;
  detail: Array<{
    semesterMataKuliah: {
      mataKuliah: {
        kode: string;
        nama: string;
        sks: number;
        biaya: number;
      };
      kelas: string;
    };
  }>;
  payment?: {
    status: string;
    metodePembayaran?: string | null;
    tanggalBayar?: string | null;
    buktiPembayaran?: string | null;
  } | null;
}

export default function AdminPendaftaranPage() {
  const [pendaftaran, setPendaftaran] = useState<PendaftaranItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPendaftaran, setSelectedPendaftaran] = useState<string | null>(
    null,
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "DITERIMA" | "DITOLAK"
  >("DITERIMA");
  const [
    selectedPendaftaranForVerification,
    setSelectedPendaftaranForVerification,
  ] = useState<PendaftaranItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendaftaranToDelete, setPendaftaranToDelete] = useState<string | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  // Fetch pendaftaran from API
  const fetchPendaftaran = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/pendaftaran?${params.toString()}`);
      if (!response.ok) throw new Error("Gagal mengambil data pendaftaran");
      const data = await response.json();
      setPendaftaran(data.pendaftaran || []);
    } catch (error) {
      console.error("Error fetching pendaftaran:", error);
      toast.error("Gagal mengambil data pendaftaran");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendaftaran();
  }, [statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPendaftaran();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredPendaftaran = pendaftaran;

  const handleVerifikasi = async () => {
    if (!selectedPendaftaran) return;

    setIsVerifying(true);
    try {
      const response = await fetch(`/api/pendaftaran/${selectedPendaftaran}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: verificationStatus,
          catatanAdmin: null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memverifikasi");
      }

      toast.success("Verifikasi berhasil", {
        description: `Pendaftaran ${
          verificationStatus === "DITERIMA" ? "diterima" : "ditolak"
        }`,
      });

      setVerificationDialog(false);
      setSelectedPendaftaran(null);
      setSelectedPendaftaranForVerification(null);
      fetchPendaftaran(); // Refresh data
    } catch (error: any) {
      toast.error("Gagal memverifikasi", {
        description: error.message || "Terjadi kesalahan saat memverifikasi",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/pendaftaran/${id}`);
      if (!response.ok) throw new Error("Gagal mengambil detail pendaftaran");
      const data = await response.json();
      setSelectedPendaftaran(id);
      setDetailModalOpen(true);
    } catch (error) {
      toast.error("Gagal mengambil detail pendaftaran");
    }
  };

  const handleSendEmail = async (id: string) => {
    setSendingEmailId(id);
    try {
      const response = await fetch(`/api/pendaftaran/${id}/send-email`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal mengirim email");
      }

      toast.success("Email berhasil dikirim", {
        description: "Email notifikasi telah dikirim ke mahasiswa",
      });
    } catch (error: any) {
      toast.error("Gagal mengirim email", {
        description: error.message || "Terjadi kesalahan saat mengirim email",
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPendaftaranToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!pendaftaranToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pendaftaran/${pendaftaranToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menghapus pendaftaran");
      }

      toast.success("Pendaftaran berhasil dihapus");
      setDeleteDialogOpen(false);
      setPendaftaranToDelete(null);
      fetchPendaftaran(); // Refresh data
    } catch (error: any) {
      toast.error("Gagal menghapus pendaftaran", {
        description: error.message || "Terjadi kesalahan saat menghapus",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DITERIMA":
        return <Badge className="bg-green-600">Diterima</Badge>;
      case "DITOLAK":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "MENUNGGU_VERIFIKASI":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
            Menunggu Verifikasi
          </Badge>
        );
      case "DIBATALKAN":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
            Dibatalkan
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const selectedPendaftaranData = pendaftaran.find(
    (p) => p.id === selectedPendaftaran,
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Manajemen Pendaftaran
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verifikasi dan kelola pendaftaran semester antara
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Pendaftaran</CardTitle>
          <CardDescription>
            {loading ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Memuat...
              </span>
            ) : (
              `${filteredPendaftaran.length} pendaftaran ditemukan`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Cari berdasarkan NIM atau nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full sm:w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="menunggu_verifikasi">
                  Menunggu Verifikasi
                </SelectItem>
                <SelectItem value="diterima">Diterima</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center whitespace-nowrap">
                      NIM
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      Nama
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      Semester
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      Tanggal
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      Mata Kuliah
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      Total Biaya
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          Memuat data...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPendaftaran.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Belum ada data pendaftaran
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPendaftaran.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-center">
                          {p.userMaster.nimOrNip}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.userMaster.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.semester.nama}
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(p.createdAt).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.detail.length} MK - {p.totalSKS} SKS
                        </TableCell>
                        <TableCell className="text-center">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(p.totalBiaya)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(p.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(p.id)}
                            >
                              Detail
                            </Button>
                            {p.status === "DITERIMA" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendEmail(p.id)}
                                disabled={sendingEmailId === p.id}
                              >
                                {sendingEmailId === p.id ? (
                                  <>
                                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                    Mengirim...
                                  </>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-envelope mr-2"></i>
                                    Kirim Email
                                  </>
                                )}
                              </Button>
                            )}
                            {p.status === "MENUNGGU_VERIFIKASI" && (
                              <div className="relative group inline-block">
                                <Button
                                  size="sm"
                                  disabled={p.payment?.status !== "LUNAS"}
                                  onClick={async () => {
                                    setSelectedPendaftaran(p.id);
                                    // Fetch full data including payment with buktiPembayaran
                                    try {
                                      const response = await fetch(
                                        `/api/pendaftaran/${p.id}`,
                                      );
                                      if (response.ok) {
                                        const data = await response.json();
                                        // Map to PendaftaranItem format
                                        const pendaftaranData: PendaftaranItem =
                                          {
                                            ...data.pendaftaran,
                                            payment: data.pendaftaran.payment
                                              ? {
                                                  status:
                                                    data.pendaftaran.payment
                                                      .status,
                                                  metodePembayaran:
                                                    data.pendaftaran.payment
                                                      .metodePembayaran,
                                                  tanggalBayar:
                                                    data.pendaftaran.payment
                                                      .tanggalBayar,
                                                  buktiPembayaran:
                                                    data.pendaftaran.payment
                                                      .buktiPembayaran,
                                                }
                                              : null,
                                          };
                                        setSelectedPendaftaranForVerification(
                                          pendaftaranData,
                                        );
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Error fetching pendaftaran:",
                                        error,
                                      );
                                      // Fallback to current data
                                      setSelectedPendaftaranForVerification(p);
                                    }
                                    setVerificationDialog(true);
                                  }}
                                >
                                  Verifikasi
                                </Button>
                                {p.payment?.status !== "LUNAS" && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-black text-white text-xs text-center rounded shadow-lg z-10">
                                    Pendaftaran ini sedang menunggu verifikasi
                                    pembayaran oleh Bagian Keuangan.
                                  </div>
                                )}
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(p.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <i className="fa-solid fa-trash"></i>
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={verificationDialog} onOpenChange={setVerificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verifikasi Pendaftaran</DialogTitle>
            <DialogDescription>
              Pilih status verifikasi untuk pendaftaran ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Bukti Pembayaran */}
            {selectedPendaftaranForVerification?.payment?.buktiPembayaran && (
              <div className="space-y-2">
                <Label>Bukti Pembayaran</Label>
                <div className="border rounded-lg overflow-hidden">
                  {selectedPendaftaranForVerification.payment.buktiPembayaran.endsWith(
                    ".pdf",
                  ) ? (
                    <div className="p-4 bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <i className="fa-solid fa-file-pdf text-4xl text-destructive mb-2"></i>
                        <p className="text-sm text-muted-foreground">
                          File PDF
                        </p>
                        <a
                          href={
                            selectedPendaftaranForVerification.payment
                              .buktiPembayaran
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-2 inline-block"
                        >
                          Buka PDF
                        </a>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={
                        selectedPendaftaranForVerification.payment
                          .buktiPembayaran
                      }
                      alt="Bukti pembayaran"
                      className="w-full h-auto max-h-96 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.png";
                      }}
                    />
                  )}
                </div>
                <a
                  href={
                    selectedPendaftaranForVerification.payment.buktiPembayaran
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <i className="fa-solid fa-external-link"></i>
                  Buka gambar di tab baru
                </a>
              </div>
            )}

            <div className="space-y-2">
              <Label>Status Verifikasi</Label>
              <Select
                value={verificationStatus}
                onValueChange={(value: "DITERIMA" | "DITOLAK") =>
                  setVerificationStatus(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DITERIMA">Diterima</SelectItem>
                  <SelectItem value="DITOLAK">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setVerificationDialog(false);
                setSelectedPendaftaranForVerification(null);
              }}
              disabled={isVerifying}
            >
              Batal
            </Button>
            <Button onClick={handleVerifikasi} disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Memproses...
                </>
              ) : verificationStatus === "DITERIMA" ? (
                "Terima"
              ) : (
                "Tolak"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pendaftaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pendaftaran akan dihapus
              permanen dan kuota mata kuliah akan dikembalikan jika status
              pendaftaran adalah Menunggu Verifikasi atau Diterima.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
            >
              {isDeleting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Modal */}
      {selectedPendaftaranData && (
        <DetailPendaftaranModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          data={{
            id: selectedPendaftaranData.id,
            semester: selectedPendaftaranData.semester.nama,
            tanggalDaftar: selectedPendaftaranData.createdAt,
            status: selectedPendaftaranData.status.toLowerCase(),
            totalMataKuliah: selectedPendaftaranData.detail.length,
            totalSKS: selectedPendaftaranData.totalSKS,
            totalBiaya: selectedPendaftaranData.totalBiaya,
            paymentStatus:
              selectedPendaftaranData.payment?.status.toLowerCase() ||
              "belum_bayar",
            paymentMethod:
              selectedPendaftaranData.payment?.metodePembayaran || "",
            tanggalBayar: selectedPendaftaranData.payment?.tanggalBayar || "",
            payment: selectedPendaftaranData.payment
              ? {
                  status: selectedPendaftaranData.payment.status,
                  tanggalBayar:
                    selectedPendaftaranData.payment.tanggalBayar || null,
                }
              : undefined,
            buktiPembayaran:
              selectedPendaftaranData.payment?.buktiPembayaran || null,
            mataKuliah: selectedPendaftaranData.detail.map((d) => ({
              kode: d.semesterMataKuliah.mataKuliah.kode,
              nama: d.semesterMataKuliah.mataKuliah.nama,
              sks: d.semesterMataKuliah.mataKuliah.sks,
              biaya: d.semesterMataKuliah.mataKuliah.biaya,
            })),
            catatan: selectedPendaftaranData.catatanAdmin,
          }}
        />
      )}
    </div>
  );
}
