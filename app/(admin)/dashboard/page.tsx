'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  semesterCount: number;
  mahasiswaCount: number;
  mataKuliahCount: number;
  pendaftaranCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    semesterCount: 0,
    mahasiswaCount: 0,
    mataKuliahCount: 0,
    pendaftaranCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [semestersRes, mataKuliahRes, usersRes, pendaftaranRes] =
          await Promise.all([
            fetch('/api/semesters'),
            fetch('/api/mata-kuliah'),
            fetch('/api/users?role=mahasiswa'),
            fetch('/api/pendaftaran'),
          ]);

        const [semestersData, mataKuliahData, usersData, pendaftaranData] =
          await Promise.all([
            semestersRes.json(),
            mataKuliahRes.json(),
            usersRes.json(),
            pendaftaranRes.json(),
          ]);

        setStats({
          semesterCount: semestersData.semesters?.length || 0,
          mahasiswaCount: usersData.users?.length || 0,
          mataKuliahCount: mataKuliahData.mataKuliah?.length || 0,
          pendaftaranCount: pendaftaranData.pendaftaran?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dashboard Admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan aktivitas dan pengelolaan Semester Antara
          </p>
        </div>

        {/* Statistik Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-muted-foreground">
                    Semester Antara
                  </CardDescription>
                  <CardTitle className="text-3xl mt-2 text-primary">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      stats.semesterCount
                    )}
                  </CardTitle>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i className="fa-solid fa-calendar-days text-primary text-xl"></i>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-muted-foreground">
                    Mahasiswa Terdaftar
                  </CardDescription>
                  <CardTitle className="text-3xl mt-2 text-green-600 dark:text-green-500">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      stats.mahasiswaCount
                    )}
                  </CardTitle>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-user-graduate text-green-600 dark:text-green-500 text-xl"></i>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-muted-foreground">
                    Mata Kuliah
                  </CardDescription>
                  <CardTitle className="text-3xl mt-2 text-purple-600 dark:text-purple-400">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      stats.mataKuliahCount
                    )}
                  </CardTitle>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-book text-purple-600 dark:text-purple-400 text-xl"></i>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Kelola Pendaftaran - tema amber */}
          <Card className="bg-linear-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800/40 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-file-pen text-amber-600 dark:text-amber-400"></i>
                </div>
                <CardTitle>Kelola Pendaftaran</CardTitle>
              </div>
              <CardDescription>
                Lihat dan verifikasi pendaftaran mahasiswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={ROUTES.ADMIN.PENDAFTARAN}>
                <Button
                  variant="outline"
                  className="w-full border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Buka Halaman Pendaftaran
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Kelola Semester Antara - tema biru */}
          <Card className="bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-calendar-days text-blue-600 dark:text-blue-400"></i>
                </div>
                <CardTitle>Kelola Semester Antara</CardTitle>
              </div>
              <CardDescription>
                Tambah, ubah, dan atur status Semester Antara
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={ROUTES.ADMIN.SEMESTER_ANTARA}>
                <Button
                  variant="outline"
                  className="w-full border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Buka Pengelolaan Semester
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800/30 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-users text-emerald-600 dark:text-emerald-400"></i>
                </div>
                <CardTitle>Manajemen User</CardTitle>
              </div>
              <CardDescription>
                Kelola akun mahasiswa, dosen, dan admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={ROUTES.ADMIN.MANAJEMEN_USER}>
                <Button
                  variant="outline"
                  className="w-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Buka Manajemen User
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800/30 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <i className="fa-solid fa-book-open text-purple-600 dark:text-purple-400"></i>
                </div>
                <CardTitle>Manajemen Mata Kuliah</CardTitle>
              </div>
              <CardDescription>
                Atur daftar mata kuliah untuk Semester Antara
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={ROUTES.ADMIN.MANAJEMEN_MATA_KULIAH}>
                <Button
                  variant="outline"
                  className="w-full border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Buka Manajemen Mata Kuliah
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
