-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MAHASISWA', 'DOSEN', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "SemesterPeriode" AS ENUM ('GANJIL', 'GENAP');

-- CreateEnum
CREATE TYPE "SemesterStatus" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "MataKuliahKategori" AS ENUM ('WAJIB', 'PILIHAN');

-- CreateEnum
CREATE TYPE "MataKuliahStatus" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "PendaftaranStatus" AS ENUM ('MENUNGGU_VERIFIKASI', 'DITERIMA', 'DITOLAK', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('BELUM_BAYAR', 'MENUNGGU_VERIFIKASI', 'LUNAS', 'DITOLAK');

-- CreateTable
CREATE TABLE "UserMaster" (
    "id" TEXT NOT NULL,
    "nimOrNip" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userMasterId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tahun" TEXT NOT NULL,
    "periode" "SemesterPeriode" NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3) NOT NULL,
    "deadlinePendaftaran" TIMESTAMP(3) NOT NULL,
    "status" "SemesterStatus" NOT NULL DEFAULT 'NONAKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MataKuliah" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "prodi" TEXT NOT NULL,
    "kategori" "MataKuliahKategori" NOT NULL,
    "status" "MataKuliahStatus" NOT NULL DEFAULT 'AKTIF',
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MataKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemesterMataKuliah" (
    "id" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "mataKuliahId" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "jadwal" TEXT NOT NULL,
    "tanggalJadwal" TIMESTAMP(3),
    "dosen" TEXT NOT NULL,
    "kuota" INTEGER NOT NULL DEFAULT 0,
    "terisi" INTEGER NOT NULL DEFAULT 0,
    "biaya" INTEGER NOT NULL DEFAULT 0,
    "prasyarat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SemesterMataKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendaftaran" (
    "id" TEXT NOT NULL,
    "userMasterId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "totalSKS" INTEGER NOT NULL DEFAULT 0,
    "totalBiaya" INTEGER NOT NULL DEFAULT 0,
    "status" "PendaftaranStatus" NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
    "catatan" TEXT,
    "catatanAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pendaftaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendaftaranDetail" (
    "id" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "semesterMataKuliahId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendaftaranDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'BELUM_BAYAR',
    "metodePembayaran" TEXT,
    "buktiPembayaran" TEXT,
    "tanggalBayar" TIMESTAMP(3),
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMaster_nimOrNip_key" ON "UserMaster"("nimOrNip");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userMasterId_key" ON "Account"("userMasterId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_resetToken_key" ON "Account"("resetToken");

-- CreateIndex
CREATE INDEX "Semester_status_idx" ON "Semester"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_tahun_periode_key" ON "Semester"("tahun", "periode");

-- CreateIndex
CREATE UNIQUE INDEX "MataKuliah_kode_key" ON "MataKuliah"("kode");

-- CreateIndex
CREATE INDEX "MataKuliah_status_idx" ON "MataKuliah"("status");

-- CreateIndex
CREATE INDEX "MataKuliah_kode_idx" ON "MataKuliah"("kode");

-- CreateIndex
CREATE INDEX "SemesterMataKuliah_semesterId_idx" ON "SemesterMataKuliah"("semesterId");

-- CreateIndex
CREATE INDEX "SemesterMataKuliah_mataKuliahId_idx" ON "SemesterMataKuliah"("mataKuliahId");

-- CreateIndex
CREATE UNIQUE INDEX "SemesterMataKuliah_semesterId_mataKuliahId_kelas_key" ON "SemesterMataKuliah"("semesterId", "mataKuliahId", "kelas");

-- CreateIndex
CREATE INDEX "Pendaftaran_userMasterId_idx" ON "Pendaftaran"("userMasterId");

-- CreateIndex
CREATE INDEX "Pendaftaran_semesterId_idx" ON "Pendaftaran"("semesterId");

-- CreateIndex
CREATE INDEX "Pendaftaran_status_idx" ON "Pendaftaran"("status");

-- CreateIndex
CREATE INDEX "Pendaftaran_createdAt_idx" ON "Pendaftaran"("createdAt");

-- CreateIndex
CREATE INDEX "PendaftaranDetail_pendaftaranId_idx" ON "PendaftaranDetail"("pendaftaranId");

-- CreateIndex
CREATE UNIQUE INDEX "PendaftaranDetail_pendaftaranId_semesterMataKuliahId_key" ON "PendaftaranDetail"("pendaftaranId", "semesterMataKuliahId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_pendaftaranId_key" ON "Payment"("pendaftaranId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterMataKuliah" ADD CONSTRAINT "SemesterMataKuliah_mataKuliahId_fkey" FOREIGN KEY ("mataKuliahId") REFERENCES "MataKuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterMataKuliah" ADD CONSTRAINT "SemesterMataKuliah_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendaftaran" ADD CONSTRAINT "Pendaftaran_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendaftaran" ADD CONSTRAINT "Pendaftaran_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendaftaranDetail" ADD CONSTRAINT "PendaftaranDetail_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "Pendaftaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendaftaranDetail" ADD CONSTRAINT "PendaftaranDetail_semesterMataKuliahId_fkey" FOREIGN KEY ("semesterMataKuliahId") REFERENCES "SemesterMataKuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "Pendaftaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
