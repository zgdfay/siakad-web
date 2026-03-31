"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  kelas: string;
  jadwal: string;
  tanggalJadwal?: string | Date | null;
  dosen: string;
  kuota: number;
  terisi: number;
  biaya: number;
  prasyarat?: string[];
}

interface Semester {
  id: string;
  nama: string;
  tahun: string;
  periode: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deadlinePendaftaran: string;
  status: "aktif" | "nonaktif";
  mataKuliah: MataKuliah[];
}

interface SemesterMataKuliahGroupProps {
  semester: Semester;
  selectedMataKuliah: string[];
  activeRegisteredMataKuliahKodes: string[];
  onSelectionChange: (mkId: string, semesterId: string) => void;
  maxSKS: number;
  totalSKSSelected: number;
}

export function SemesterMataKuliahGroup({
  semester,
  selectedMataKuliah,
  activeRegisteredMataKuliahKodes,
  onSelectionChange,
  maxSKS,
  totalSKSSelected,
}: SemesterMataKuliahGroupProps) {
  const [isOpen, setIsOpen] = useState(semester.status === "aktif");
  const isDeadlinePassed = new Date(semester.deadlinePendaftaran) < new Date();
  const isDisabled = semester.status === "nonaktif" || isDeadlinePassed;

  const handleToggleMataKuliah = (mkId: string) => {
    // Jika disabled (nonaktif atau deadline lewat), tidak bisa memilih
    if (isDisabled) return;

    const mk = semester.mataKuliah.find((m) => m.id === mkId);
    if (!mk) return;

    // Cek kuota
    if (mk.terisi >= mk.kuota) return;

    // Cek SKS limit
    const isSelected = selectedMataKuliah.includes(mkId);
    if (!isSelected) {
      if (totalSKSSelected + mk.sks > maxSKS) {
        return; // Tidak bisa memilih lebih dari max SKS
      }
    }

    onSelectionChange(mkId, semester.id);
  };

  const isKuotaPenuh = (mk: MataKuliah) => mk.terisi >= mk.kuota;

  return (
    <Card className="transition-all hover:shadow-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                  >
                    <i
                      className={`fa-solid fa-chevron-${
                        isOpen ? "down" : "right"
                      } text-xs`}
                    ></i>
                  </Button>
                </CollapsibleTrigger>
                <CardTitle className="text-base sm:text-lg truncate">
                  {semester.nama}
                </CardTitle>
                {semester.status === "nonaktif" ? (
                  <Badge variant="secondary" className="shrink-0">
                    Nonaktif
                  </Badge>
                ) : isDeadlinePassed ? (
                  <Badge variant="destructive" className="shrink-0">
                    Tutup
                  </Badge>
                ) : (
                  <Badge variant="default" className="shrink-0">
                    Aktif
                  </Badge>
                )}
              </div>
              <CardDescription className="ml-8 sm:ml-9 text-xs sm:text-sm">
                {semester.tahun} - {semester.periode} •{" "}
                {semester.mataKuliah.length} Mata Kuliah
              </CardDescription>
            </div>
            <div className="text-left lg:text-right text-xs sm:text-sm text-muted-foreground space-y-1 lg:min-w-0 lg:max-w-xs">
              <div className="break-words">
                <span className="font-medium">Tanggal Mulai:</span>{" "}
                <span className="block sm:inline lg:block">
                  {new Date(semester.tanggalMulai).toLocaleDateString("id-ID", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="break-words">
                <span className="font-medium">Tanggal Selesai:</span>{" "}
                <span className="block sm:inline lg:block">
                  {new Date(semester.tanggalSelesai).toLocaleDateString(
                    "id-ID",
                    {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>
              <div
                className={`break-words ${isDeadlinePassed ? "text-destructive font-medium" : ""}`}
              >
                <span className="font-medium">Deadline:</span>{" "}
                <span className="block sm:inline lg:block">
                  {new Date(semester.deadlinePendaftaran).toLocaleDateString(
                    "id-ID",
                    {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {isDisabled && (
                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center">
                  {semester.status === "nonaktif"
                    ? "Semester ini tidak aktif. Pendaftaran ditutup."
                    : "Deadline pendaftaran sudah lewat. Pendaftaran ditutup."}
                </div>
              )}
              {semester.mataKuliah.map((mk) => {
                const isSelected = selectedMataKuliah.includes(mk.id);
                const isAlreadyRegistered =
                  activeRegisteredMataKuliahKodes.includes(mk.kode);
                const isFull = isKuotaPenuh(mk);
                const available = mk.kuota - mk.terisi;
                const mkDisabled = isDisabled || isFull || isAlreadyRegistered;

                return (
                  <Card
                    key={mk.id}
                    className={`transition-all ${
                      isSelected ? "ring-2 ring-primary" : ""
                    } ${
                      mkDisabled
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer hover:shadow-md"
                    }`}
                    onClick={() => !mkDisabled && handleToggleMataKuliah(mk.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-sm sm:text-base break-words">
                              {mk.nama}
                            </CardTitle>
                            <div className="flex items-center gap-1 flex-wrap shrink-0">
                              {isSelected && (
                                <Badge variant="default" className="text-xs">
                                  Dipilih
                                </Badge>
                              )}
                              {isFull && !isAlreadyRegistered && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Kuota Penuh
                                </Badge>
                              )}
                              {isAlreadyRegistered && (
                                <Badge variant="secondary" className="text-xs">
                                  Sudah Diambil
                                </Badge>
                              )}
                              {isDisabled &&
                                !isFull &&
                                !isAlreadyRegistered && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Tidak Tersedia
                                  </Badge>
                                )}
                            </div>
                          </div>
                          <CardDescription className="text-xs sm:text-sm">
                            {mk.kode} - {mk.sks} SKS - Kelas {mk.kelas}
                          </CardDescription>
                        </div>
                        <Checkbox
                          checked={isSelected}
                          disabled={mkDisabled}
                          onCheckedChange={() => handleToggleMataKuliah(mk.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                        {mk.jadwal && mk.jadwal !== '-' && mk.dosen && mk.dosen !== '-' ? (
                          <>
                            <div>
                              <span className="text-muted-foreground">Jadwal:</span>
                              <p className="font-medium break-words">{mk.jadwal}</p>
                            </div>
                            {mk.tanggalJadwal && (
                              <div>
                                <span className="text-muted-foreground">
                                  Tanggal Jadwal:
                                </span>
                                <p className="font-medium break-words">
                                  {new Date(mk.tanggalJadwal).toLocaleDateString(
                                    "id-ID",
                                    {
                                      weekday: "short",
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Dosen:</span>
                              <p className="font-medium break-words">{mk.dosen}</p>
                            </div>
                          </>
                        ) : (
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground">Jadwal & Dosen:</span>
                            <p className="font-medium text-amber-600 dark:text-amber-400 italic text-xs mt-0.5">
                              <i className="fa-solid fa-clock mr-1"></i>
                              Menunggu Konfirmasi Panitia
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Kuota:</span>
                          <p className="font-medium">
                            {isFull ? (
                              <span className="text-destructive">
                                {mk.terisi} / {mk.kuota} (Penuh)
                              </span>
                            ) : (
                              <span>
                                {mk.terisi} / {mk.kuota} ({available} tersedia)
                              </span>
                            )}
                          </p>
                        </div>
                        {/* <div>
                          <span className="text-muted-foreground">Biaya:</span>
                          <p className="font-medium break-words">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(mk.biaya)}
                          </p>
                        </div> */}
                      </div>
                      {mk.prasyarat && mk.prasyarat.length > 0 && (
                        <div className="pt-2 border-t">
                          <span className="text-xs text-muted-foreground">
                            Prasyarat:{" "}
                          </span>
                          <span className="text-xs">
                            {mk.prasyarat.join(", ")}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
