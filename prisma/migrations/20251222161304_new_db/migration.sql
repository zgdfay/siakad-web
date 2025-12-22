-- CreateEnum
CREATE TYPE "JadwalStatus" AS ENUM ('AKTIF', 'SELESAI');

-- AlterTable
ALTER TABLE "PendaftaranDetail" ADD COLUMN     "statusJadwal" "JadwalStatus" NOT NULL DEFAULT 'AKTIF';

-- AlterTable
ALTER TABLE "UserMaster" ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "PendaftaranDetail_statusJadwal_idx" ON "PendaftaranDetail"("statusJadwal");
