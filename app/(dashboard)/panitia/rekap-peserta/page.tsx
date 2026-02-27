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
  Download,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Participant {
  id: string;
  pendaftaran: {
    userMaster: {
      name: string;
      nimOrNip: string;
    };
  };
}

interface KelasRekap {
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

export default function RekapPesertaPage() {
  const [kelasList, setKelasList] = useState<KelasRekap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/panitia/rekap");
      if (!res.ok) throw new Error("Gagal mengambil data rekap");
      const data = await res.json();
      setKelasList(data.data);
    } catch (error) {
      toast.error("Gagal memuat rekap peserta");
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

  const filteredList = kelasList.filter((k) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      k.mataKuliah.nama.toLowerCase().includes(searchLower) ||
      k.mataKuliah.kode.toLowerCase().includes(searchLower)
    );
  });

  const exportToCSV = (kelas: KelasRekap) => {
    if (kelas.pendaftaranDetail.length === 0) {
      toast.info("Tidak ada peserta untuk diexport");
      return;
    }

    const headers = ["No", "NIM", "Nama Mahasiswa"];
    const rows = kelas.pendaftaranDetail.map((p, index) => [
      index + 1,
      p.pendaftaran.userMaster.nimOrNip,
      p.pendaftaran.userMaster.name,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rekap_${kelas.mataKuliah.kode}_${kelas.mataKuliah.nama}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("File CSV berhasil diunduh");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rekap Peserta</h1>
        <p className="text-muted-foreground mt-2">
          Pantau jumlah pendaftar per mata kuliah dan unduh data peserta.
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
              <TableHead>Total Peserta</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    Memuat data rekap...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  Tidak ada kelas yang ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((k) => (
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
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span
                            className={
                              k.pendaftaranDetail.length >= k.kuotaPendaftar
                                ? "text-amber-600 font-medium"
                                : ""
                            }
                          >
                            {k.pendaftaranDetail.length} / {k.kuotaPendaftar}
                          </span>
                        </div>
                        {k.pendaftaranDetail.length >= k.kuotaPendaftar && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Kelas Penuh
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{k.semester.nama}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportToCSV(k);
                          }}
                          disabled={k.pendaftaranDetail.length === 0}
                        >
                          <Download className="h-4 w-4 mr-2" /> Export CSV
                        </Button>
                      </TableCell>
                    </TableRow>

                    <CollapsibleContent asChild>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={6} className="p-0 border-b-0">
                          <div className="p-4 pl-[66px]">
                            {k.pendaftaranDetail.length === 0 ? (
                              <div className="text-sm text-muted-foreground italic py-2">
                                Belum ada pendaftar yang pembayarannya berstatus
                                lunas.
                              </div>
                            ) : (
                              <div className="border rounded-md bg-background overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                      <TableHead className="w-[60px] text-center">
                                        No
                                      </TableHead>
                                      <TableHead>NIM</TableHead>
                                      <TableHead>Nama Mahasiswa</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {k.pendaftaranDetail.map((p, index) => (
                                      <TableRow key={p.id}>
                                        <TableCell className="text-center text-muted-foreground">
                                          {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {p.pendaftaran.userMaster.nimOrNip}
                                        </TableCell>
                                        <TableCell>
                                          {p.pendaftaran.userMaster.name}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
