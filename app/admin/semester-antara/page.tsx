'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SemesterAntara {
  id: string;
  nama: string;
  tahun: string;
  periode: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'aktif' | 'nonaktif';
}

export default function SemesterAntaraPage() {
  const [semesterList, setSemesterList] = useState<SemesterAntara[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSemester = semesterList.filter((semester) =>
    semester.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    semester.tahun.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Semester Antara</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kelola data semester antara
          </p>
        </div>
        <Link
          href="/admin/semester-antara/tambah"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + Tambah Semester Antara
        </Link>
      </div>

      {/* Search Bar */}
      <div className="rounded-lg bg-white p-4 shadow">
        <input
          type="text"
          placeholder="Cari semester antara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nama Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tahun
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Periode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tanggal Mulai
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tanggal Selesai
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredSemester.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <p className="mb-2">Belum ada data semester antara</p>
                  <Link
                    href="/admin/semester-antara/tambah"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Tambah semester antara pertama
                  </Link>
                </td>
              </tr>
            ) : (
              filteredSemester.map((semester) => (
                <tr key={semester.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {semester.nama}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {semester.tahun}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {semester.periode}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(semester.tanggalMulai).toLocaleDateString('id-ID')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(semester.tanggalSelesai).toLocaleDateString('id-ID')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        semester.status === 'aktif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {semester.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/admin/semester-antara/${semester.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

