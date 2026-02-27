"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Send } from "lucide-react";

interface Jadwal {
  id: string;
  mataKuliah: { kode: string; nama: string };
}

interface Nilai {
  id: string;
  nilaiHuruf: string | null;
  nilaiAngka: number | null;
  status: "DRAFT" | "SUBMITTED" | "LOCKED";
}

interface Student {
  id: string;
  pendaftaran: {
    userMaster: {
      name: string;
      nimOrNip: string;
    };
  };
  nilai: Nilai | null;
}

function DosenNilaiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMkId = searchParams.get("mkId");

  const [classes, setClasses] = useState<Jadwal[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialMkId || "",
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Local state for editing grades
  const [editingGrades, setEditingGrades] = useState<
    Record<string, { angka: string; huruf: string }>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // 1. Fetch available classes for this Dosen
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const res = await fetch("/api/dosen/jadwal");
        if (!res.ok) throw new Error("Gagal mengambil jadwal");
        const data = await res.json();
        setClasses(data.schedules);

        // Auto select first class if none in URL
        if (!initialMkId && data.schedules.length > 0) {
          setSelectedClassId(data.schedules[0].id);
        }
      } catch (error) {
        toast.error("Gagal memuat daftar kelas");
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [initialMkId]);

  // 2. Fetch students when selected class changes
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        // Clear old inputs
        setEditingGrades({});

        const res = await fetch(
          `/api/dosen/nilai?semesterMataKuliahId=${selectedClassId}`,
        );
        if (!res.ok) throw new Error("Gagal mengambil daftar mahasiswa");
        const data = await res.json();
        setStudents(data.students);

        // Pre-fill inputs with existing data
        const initialEdits: Record<string, { angka: string; huruf: string }> =
          {};
        data.students.forEach((s: Student) => {
          if (s.nilai) {
            initialEdits[s.id] = {
              angka:
                s.nilai.nilaiAngka !== null
                  ? s.nilai.nilaiAngka.toString()
                  : "",
              huruf: s.nilai.nilaiHuruf || "",
            };
          } else {
            initialEdits[s.id] = { angka: "", huruf: "" };
          }
        });
        setEditingGrades(initialEdits);

        // Update URL to match selected class
        router.replace(`/dosen/nilai?mkId=${selectedClassId}`, {
          scroll: false,
        });
      } catch (error) {
        toast.error("Gagal memuat data mahasiswa");
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedClassId, router]);

  const handleInputChange = (
    studentId: string,
    field: "angka" | "huruf",
    value: string,
  ) => {
    setEditingGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value.toUpperCase(),
      },
    }));
  };

  const saveGrade = async (
    studentId: string,
    action: "DRAFT" | "SUBMITTED",
  ) => {
    const grade = editingGrades[studentId];
    if (!grade.angka && !grade.huruf) {
      toast.error("Isi minimal salah satu field (Nilai Angka / Huruf)");
      return;
    }

    try {
      if (action === "DRAFT") setSavingId(studentId);
      if (action === "SUBMITTED") setSubmittingId(studentId);

      const res = await fetch("/api/dosen/nilai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftaranDetailId: studentId,
          nilaiAngka: grade.angka || null,
          nilaiHuruf: grade.huruf || null,
          status: action,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan nilai");

      toast.success(
        action === "SUBMITTED"
          ? "Nilai berhasil di-submit"
          : "Draft nilai disimpan",
      );

      // Update local state to reflect changes
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentId) {
            return {
              ...s,
              nilai: data.nilai,
            };
          }
          return s;
        }),
      );
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      if (action === "DRAFT") setSavingId(null);
      if (action === "SUBMITTED") setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Input Nilai Kelas</h1>
        <p className="text-muted-foreground mt-2">
          Pilih mata kuliah dan masukkan komponen nilai mahasiswa.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/50 p-4 rounded-lg border">
        <label className="font-medium whitespace-nowrap">Pilih Kelas:</label>
        <Select
          value={selectedClassId}
          onValueChange={setSelectedClassId}
          disabled={isLoadingClasses}
        >
          <SelectTrigger className="w-full sm:max-w-md bg-background">
            <SelectValue placeholder="Pilih Mata Kuliah..." />
          </SelectTrigger>
          <SelectContent>
            {classes.length === 0 && !isLoadingClasses && (
              <SelectItem value="empty" disabled>
                Belum ada jadwal mengajar
              </SelectItem>
            )}
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.mataKuliah.kode} - {c.mataKuliah.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No</TableHead>
              <TableHead>Mahasiswa</TableHead>
              <TableHead className="w-[120px]">Nilai Angka</TableHead>
              <TableHead className="w-[120px]">Nilai Huruf</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
              <TableHead className="text-right w-[200px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingStudents ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    Memuat daftar mahasiswa...
                  </div>
                </TableCell>
              </TableRow>
            ) : !selectedClassId ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground italic"
                >
                  Silakan pilih kelas terlebih dahulu.
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  Tidak ada mahasiswa terdaftar di kelas ini.
                </TableCell>
              </TableRow>
            ) : (
              students.map((s, index) => {
                const isLocked = s.nilai?.status === "LOCKED";
                const isSubmitted = s.nilai?.status === "SUBMITTED";
                const isReadOnly = isLocked || isSubmitted;

                return (
                  <TableRow
                    key={s.id}
                    className={isLocked ? "bg-muted/30" : ""}
                  >
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {s.pendaftaran.userMaster.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {s.pendaftaran.userMaster.nimOrNip}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0-100"
                        value={editingGrades[s.id]?.angka || ""}
                        onChange={(e) =>
                          handleInputChange(s.id, "angka", e.target.value)
                        }
                        disabled={isReadOnly}
                        className={
                          isReadOnly ? "bg-muted cursor-not-allowed" : ""
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        maxLength={2}
                        placeholder="A/B/C..."
                        value={editingGrades[s.id]?.huruf || ""}
                        onChange={(e) =>
                          handleInputChange(s.id, "huruf", e.target.value)
                        }
                        disabled={isReadOnly}
                        className={`font-medium ${isReadOnly ? "bg-muted cursor-not-allowed" : ""}`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {!s.nilai ? (
                        <span className="text-xs text-muted-foreground italic">
                          KOSONG
                        </span>
                      ) : s.nilai.status === "LOCKED" ? (
                        <Badge variant="secondary" className="text-xs">
                          LOCKED
                        </Badge>
                      ) : s.nilai.status === "SUBMITTED" ? (
                        <Badge className="bg-emerald-500 text-xs text-white">
                          SUBMIT
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs text-amber-600 border-amber-600"
                        >
                          DRAFT
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isLocked ? (
                        <span className="text-sm text-muted-foreground italic mr-2">
                          Dikunci Panitia
                        </span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            title="Simpan Draft"
                            disabled={isReadOnly || savingId === s.id}
                            onClick={() => saveGrade(s.id, "DRAFT")}
                          >
                            {savingId === s.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant={isSubmitted ? "secondary" : "default"}
                            size="sm"
                            title="Submit Final"
                            disabled={isReadOnly || submittingId === s.id}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Kirim nilai permanen? Anda tidak bisa mengedit setelah submit (kecuali meminta panitia).",
                                )
                              ) {
                                saveGrade(s.id, "SUBMITTED");
                              }
                            }}
                          >
                            {submittingId === s.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <Send className="w-4 h-4 mr-1" />
                            )}
                            Submit
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function DosenNilaiPage() {
  return (
    <Suspense fallback={<div>Memuat antarmuka...</div>}>
      <DosenNilaiContent />
    </Suspense>
  );
}
