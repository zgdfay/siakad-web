"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, GraduationCap, CheckCircle2 } from "lucide-react";

interface Pendaftaran {
  id: string;
  status: string;
  semester: {
    id: string;
    nama: string;
    tahun: number;
    periode: string;
  };
  detail: {
    id: string;
    semesterMataKuliah: {
      mataKuliah: {
        kode: string;
        nama: string;
        sks: number;
      };
    };
    nilai: {
      nilaiHuruf: string | null;
      nilaiAngka: number | null;
      status: "DRAFT" | "SUBMITTED" | "LOCKED";
    } | null;
  }[];
}

export default function MahasiswaNilaiPage() {
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/pendaftaran/user/me?status=DITERIMA");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setPendaftaranList(data.pendaftaran);
    } catch (error) {
      toast.error("Gagal memuat daftar nilai Anda");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transkrip Nilai</h1>
        <p className="text-muted-foreground mt-2">
          Lihat hasil studi Anda untuk setiap periode Semester Antara.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          Memuat data nilai Anda...
        </div>
      ) : pendaftaranList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border rounded-lg bg-muted/20">
          <GraduationCap className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <h2 className="text-lg font-medium text-foreground">
            Belum Ada Riwayat Studi
          </h2>
          <p className="mt-1">
            Anda belum pernah menyelesaikan pendaftaran Semester Antara.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pendaftaranList.map((p) => {
            let totalSks = 0;
            let totalBobot = 0;
            let isValidGPA = true;

            const calculateBobot = (huruf: string | null) => {
              switch (huruf) {
                case "A":
                  return 4;
                case "AB":
                  return 3.5;
                case "B":
                  return 3;
                case "BC":
                  return 2.5;
                case "C":
                  return 2;
                case "D":
                  return 1;
                case "E":
                  return 0;
                default:
                  return 0;
              }
            };

            const details = p.detail.map((d) => {
              const mk = d.semesterMataKuliah.mataKuliah;
              const isLocked = d.nilai?.status === "LOCKED";
              const isSubmitted = d.nilai?.status === "SUBMITTED" || isLocked;

              const sks = mk.sks;
              const huruf = isSubmitted ? d.nilai?.nilaiHuruf : null;
              const bobot = calculateBobot(huruf);

              if (isSubmitted && huruf) {
                totalSks += sks;
                totalBobot += bobot * sks;
              } else {
                isValidGPA = false; // Cannot calculate final IP if not all locked
              }

              return {
                id: d.id,
                kode: mk.kode,
                nama: mk.nama,
                sks: sks,
                nilaiHuruf: huruf || "-",
                isFinal: isLocked,
                isSubmitted: isSubmitted,
              };
            });

            const ipSemester =
              totalSks > 0 ? (totalBobot / totalSks).toFixed(2) : "0.00";
            const allLocked = p.detail.every(
              (d) => d.nilai?.status === "LOCKED",
            );

            return (
              <Card key={p.id} className="overflow-hidden">
                <CardHeader className="bg-muted/40 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {p.semester.nama}
                        {allLocked && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Tahun Ajaran {p.semester.tahun} - {p.semester.periode}
                      </CardDescription>
                    </div>
                    {allLocked && (
                      <div className="text-right bg-background p-3 rounded-md border shadow-sm">
                        <div className="text-sm text-muted-foreground font-medium">
                          IP Semester (SA)
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {ipSemester}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/10 hover:bg-muted/10">
                        <TableHead className="w-[100px]">Kode MK</TableHead>
                        <TableHead>Mata Kuliah</TableHead>
                        <TableHead className="text-center w-[80px]">
                          SKS
                        </TableHead>
                        <TableHead className="text-center w-[120px]">
                          Nilai Akhir
                        </TableHead>
                        <TableHead className="text-right w-[150px]">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {d.kode}
                          </TableCell>
                          <TableCell className="font-medium">
                            {d.nama}
                          </TableCell>
                          <TableCell className="text-center">{d.sks}</TableCell>
                          <TableCell className="text-center">
                            {d.isSubmitted ? (
                              <span className="font-bold text-lg">
                                {d.nilaiHuruf}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {d.isFinal ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                Final
                              </Badge>
                            ) : d.isSubmitted ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500 text-emerald-600"
                              >
                                Proses Arsip
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Belum Keluar</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
