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
import { Input } from "@/components/ui/input";
import { Search, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Jadwal {
  id: string;
  kuotaPendaftar: number;
  jadwal: string[];
  ruangan: string;
  mataKuliah: {
    kode: string;
    nama: string;
    sks: number;
    semester: number;
  };
  semester: {
    nama: string;
    tahun: number;
    periode: string;
  };
  _count: {
    pendaftaranDetail: number;
  };
}

export default function DosenJadwalPage() {
  const [schedules, setSchedules] = useState<Jadwal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/dosen/jadwal");
      if (!res.ok) throw new Error("Gagal mengambil jadwal mengajar");
      const data = await res.json();
      setSchedules(data.schedules);
    } catch (error) {
      toast.error("Gagal memuat jadwal mengajar");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredList = schedules.filter((s) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      s.mataKuliah.nama.toLowerCase().includes(searchLower) ||
      s.mataKuliah.kode.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jadwal Mengajar</h1>
        <p className="text-muted-foreground mt-2">
          Daftar mata kuliah Semester Antara yang ditugaskan kepada Anda.
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
              <TableHead>Mata Kuliah</TableHead>
              <TableHead>SKS / Smt</TableHead>
              <TableHead>Jadwal Kelas</TableHead>
              <TableHead>Ruangan</TableHead>
              <TableHead>Peserta</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    Memuat jadwal Anda...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  Anda belum ditugaskan mengajar di Semester Antara ini.
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.mataKuliah.nama}</div>
                    <div className="text-sm text-muted-foreground">
                      {s.mataKuliah.kode}
                    </div>
                  </TableCell>
                  <TableCell>
                    {s.mataKuliah.sks} SKS / Smt {s.mataKuliah.semester}
                  </TableCell>
                  <TableCell>
                    {s.jadwal.length > 0 ? (
                      <ul className="list-disc list-inside text-sm">
                        {s.jadwal.map((j, i) => (
                          <li key={i}>{j}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground italic">
                        Menunggu Jadwal
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{s.ruangan || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {s._count.pendaftaranDetail} / {s.kuotaPendaftar}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dosen/nilai?mkId=${s.id}`}>
                        Lihat Absensi & Nilai
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
