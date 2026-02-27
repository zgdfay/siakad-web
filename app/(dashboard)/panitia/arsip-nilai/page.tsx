"use client";

import { useState, useEffect } from "react";
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
import {
  Search,
  Loader2,
  Lock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

interface Nilai {
  id: string;
  nilaiHuruf: string;
  nilaiAngka: number | null;
  status: "DRAFT" | "SUBMITTED" | "LOCKED";
}

interface Participant {
  id: string;
  pendaftaran: {
    userMaster: {
      name: string;
      nimOrNip: string;
    };
  };
  nilai: Nilai | null;
}

interface KelasNilai {
  id: string;
  dosen: string | null;
  kuotaPendaftar: number;
  mataKuliah: {
    kode: string;
    nama: string;
    sks: number;
  };
  semester: {
    nama: string;
    tahun: number;
    periode: string;
  };
  pendaftaranDetail: Participant[];
}

export default function ArsipNilaiPage() {
  const [kelasList, setKelasList] = useState<KelasNilai[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});
  const [isLocking, setIsLocking] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/panitia/nilai");
      if (!res.ok) throw new Error("Gagal mengambil data nilai");
      const data = await res.json();
      setKelasList(data.data);
    } catch (error) {
      toast.error("Gagal memuat arsip nilai");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    setOpenStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLockNilai = async (id: string) => {
    try {
      setIsLocking(id);
      const res = await fetch("/api/panitia/nilai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semesterMataKuliahId: id }),
      });

      if (!res.ok) throw new Error("Gagal mengunci nilai");

      const resData = await res.json();
      toast.success(resData.message || "Nilai kelas berhasil diarsipkan");
      fetchData(); // Refresh data to show LOCKED status
    } catch (error) {
      toast.error("Gagal mengunci nilai mahasiswa");
      console.error(error);
    } finally {
      setIsLocking(null);
      setConfirmDialog(null);
    }
  };

  const filteredList = kelasList.filter((k) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      k.mataKuliah.nama.toLowerCase().includes(searchLower) ||
      k.mataKuliah.kode.toLowerCase().includes(searchLower)
    );
  });

  const getPercentageSubmitted = (peserta: Participant[]) => {
    if (peserta.length === 0) return 0;
    const submittedCount = peserta.filter(
      (p) => p.nilai?.status === "SUBMITTED" || p.nilai?.status === "LOCKED",
    ).length;
    return Math.round((submittedCount / peserta.length) * 100);
  };

  const isAllLocked = (peserta: Participant[]) => {
    if (peserta.length === 0) return false;
    return peserta.every((p) => p.nilai?.status === "LOCKED");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Arsip Nilai</h1>
        <p className="text-muted-foreground mt-2">
          Pantau progres input nilai dari Dosen dan kunci nilai untuk diarsipkan
          secara permanen.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari Mata Kuliah atau Kode..."
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
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead>Dosen Pengampu</TableHead>
              <TableHead>Progres Nilai</TableHead>
              <TableHead>Status Arsip</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    Memuat data arsip nilai...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  Tidak ada data kelas yang ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((k) => {
                const progress = getPercentageSubmitted(k.pendaftaranDetail);
                const isLocked = isAllLocked(k.pendaftaranDetail);

                return (
                  <Collapsible
                    key={k.id}
                    asChild
                    open={openStates[k.id]}
                    onOpenChange={() => toggleRow(k.id)}
                  >
                    <>
                      <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8"
                            >
                              {openStates[k.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{k.mataKuliah.nama}</div>
                          <div className="text-sm text-muted-foreground">
                            {k.mataKuliah.kode} • {k.mataKuliah.sks} SKS
                          </div>
                        </TableCell>
                        <TableCell>
                          {k.dosen || (
                            <span className="text-muted-foreground italic">
                              Belum ditentukan
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${progress === 100 ? "bg-emerald-500" : "bg-primary"}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {progress}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {
                              k.pendaftaranDetail.filter((p) => !!p.nilai)
                                .length
                            }{" "}
                            / {k.pendaftaranDetail.length} Dinilai
                          </div>
                        </TableCell>
                        <TableCell>
                          {k.pendaftaranDetail.length === 0 ? (
                            <span className="text-muted-foreground italic text-sm">
                              -
                            </span>
                          ) : isLocked ? (
                            <Badge className="bg-slate-500">
                              <Lock className="w-3 h-3 mr-1" /> Terkunci
                            </Badge>
                          ) : progress === 100 ? (
                            <Badge className="bg-amber-500">
                              Menunggu Arsip
                            </Badge>
                          ) : (
                            <Badge variant="outline">Diproses Dosen</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={isLocked ? "secondary" : "default"}
                            size="sm"
                            className={
                              !isLocked && progress === 100
                                ? "bg-amber-600 hover:bg-amber-700"
                                : ""
                            }
                            disabled={
                              isLocked || k.pendaftaranDetail.length === 0
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              if (progress < 100) {
                                toast.warning(
                                  "Belum semua mahasiswa dinilai oleh Dosen.",
                                );
                                return;
                              }
                              setConfirmDialog(k.id);
                            }}
                          >
                            {isLocked ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Telah
                                Diarsipkan
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-2" /> Kunci Nilai
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>

                      <CollapsibleContent asChild>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={6} className="p-0 border-b-0">
                            <div className="p-4 pl-[66px]">
                              {k.pendaftaranDetail.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic py-2">
                                  Belum ada mahasiswa di kelas ini.
                                </div>
                              ) : (
                                <div className="border rounded-md bg-background overflow-hidden max-w-3xl">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead>Mahasiswa</TableHead>
                                        <TableHead className="w-[100px] text-center">
                                          Nilai Angka
                                        </TableHead>
                                        <TableHead className="w-[100px] text-center">
                                          Nilai Huruf
                                        </TableHead>
                                        <TableHead className="w-[120px] text-center">
                                          Status
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {k.pendaftaranDetail.map((p) => (
                                        <TableRow key={p.id}>
                                          <TableCell>
                                            <div className="font-medium">
                                              {p.pendaftaran.userMaster.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {
                                                p.pendaftaran.userMaster
                                                  .nimOrNip
                                              }
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {p.nilai?.nilaiAngka ?? "-"}
                                          </TableCell>
                                          <TableCell className="text-center font-bold text-lg">
                                            {p.nilai?.nilaiHuruf ?? "-"}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {!p.nilai ? (
                                              <span className="text-xs text-muted-foreground italic">
                                                KOSONG
                                              </span>
                                            ) : p.nilai.status === "LOCKED" ? (
                                              <Badge
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                LOCKED
                                              </Badge>
                                            ) : p.nilai.status ===
                                              "SUBMITTED" ? (
                                              <Badge className="bg-emerald-500 text-xs text-white">
                                                SUBMIT
                                              </Badge>
                                            ) : (
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                DRAFT
                                              </Badge>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={() => setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arsipkan dan Kunci Nilai?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan mengunci semua nilai mahasiswa di kelas ini
              secara permanen. Dosen <strong>tidak akan bisa</strong> lagi
              mengubah nilai yang sudah dikunci.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLocking !== null}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog && handleLockNilai(confirmDialog)}
              disabled={isLocking !== null}
              className="bg-primary text-primary-foreground"
            >
              {isLocking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunci...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" /> Ya, Kunci Permanen
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
