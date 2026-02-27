"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Search, Loader2, Eye, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Pendaftaran {
  id: string;
  createdAt: string;
  statusKelayakan: "BELUM_DIPROSES" | "LAYAK" | "TIDAK_LAYAK";
  khsUrl: string | null;
  userMaster: {
    name: string;
    nimOrNip: string;
  };
  semester: {
    nama: string;
    tahun: number;
    periode: string;
  };
}

export default function VerifikasiKHSPage() {
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKHS, setSelectedKHS] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchPendaftarans();
  }, []);

  const fetchPendaftarans = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/panitia/verifikasi-khs");
      if (!res.ok) throw new Error("Gagal mengambil data pendaftaran");
      const data = await res.json();
      setPendaftaranList(data.pendaftaran);
    } catch (error) {
      toast.error("Gagal memuat data pendaftaran");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifikasi = async (
    id: string,
    status: "LAYAK" | "TIDAK_LAYAK",
  ) => {
    try {
      setIsUpdating(id);
      const res = await fetch("/api/panitia/verifikasi-khs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftaranId: id,
          statusKelayakan: status,
        }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status");

      toast.success(status === "LAYAK" ? "KHS diterima" : "KHS ditolak");
      fetchPendaftarans(); // Refresh data
    } catch (error) {
      toast.error("Gagal memperbarui status KHS");
      console.error(error);
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredList = pendaftaranList.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.userMaster.name?.toLowerCase().includes(searchLower) ||
      p.userMaster.nimOrNip.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LAYAK":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600">
            Layak (Diterima)
          </Badge>
        );
      case "TIDAK_LAYAK":
        return <Badge variant="destructive">Tidak Layak (Ditolak)</Badge>;
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 hover:bg-amber-200"
          >
            Menunggu Verifikasi
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Verifikasi KHS</h1>
        <p className="text-muted-foreground mt-2">
          Periksa dan verifikasi kelayakan KHS pendaftar Semester Antara.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau NIM..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mahasiswa</TableHead>
              <TableHead>Periode SA</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    Sedang memuat data...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  Belum ada data pendaftar yang mengunggah KHS.
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.userMaster.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {p.userMaster.nimOrNip}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.semester.nama} ({p.semester.tahun} - {p.semester.periode}
                    )
                  </TableCell>
                  <TableCell>
                    {format(new Date(p.createdAt), "dd MMM yyyy, HH:mm", {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(p.statusKelayakan)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {p.khsUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedKHS(p.khsUrl)}
                        title="Lihat Dokumen KHS"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View KHS
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground italic mr-4">
                        Belum upload
                      </span>
                    )}

                    {p.statusKelayakan === "BELUM_DIPROSES" && p.khsUrl && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={isUpdating === p.id}
                          onClick={() => handleVerifikasi(p.id, "LAYAK")}
                        >
                          {isUpdating === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isUpdating === p.id}
                          onClick={() => handleVerifikasi(p.id, "TIDAK_LAYAK")}
                        >
                          {isUpdating === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Preview KHS */}
      <Dialog open={!!selectedKHS} onOpenChange={() => setSelectedKHS(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Dokumen KHS</DialogTitle>
            <DialogDescription>
              Pastikan mahasiswa memenuhi syarat SKS dan IPK untuk mengikuti
              Semester Antara.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-muted rounded-md overflow-hidden relative">
            {selectedKHS && (
              <iframe
                src={selectedKHS}
                className="w-full h-full border-0 absolute inset-0"
                title="Dokumen KHS"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
