'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function TambahSemesterAntaraPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: '',
    tahun: '',
    periode: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    status: 'aktif' as 'aktif' | 'nonaktif',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validasi
      if (new Date(formData.tanggalMulai) > new Date(formData.tanggalSelesai)) {
        setError('Tanggal mulai harus sebelum tanggal selesai');
        setLoading(false);
        return;
      }

      // TODO: Implementasi logika simpan ke database
      console.log('Tambah semester antara:', formData);
      
      // Simulasi simpan
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect ke halaman list setelah berhasil
      router.push(ROUTES.ADMIN.SEMESTER_ANTARA);
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Semester Antara</h1>
        <p className="mt-1 text-sm text-gray-600">
          Isi form di bawah untuk menambahkan semester antara baru
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                Nama Semester <span className="text-red-500">*</span>
              </label>
              <input
                id="nama"
                name="nama"
                type="text"
                required
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Contoh: Semester Antara 2024"
              />
            </div>

            <div>
              <label htmlFor="tahun" className="block text-sm font-medium text-gray-700">
                Tahun <span className="text-red-500">*</span>
              </label>
              <input
                id="tahun"
                name="tahun"
                type="text"
                required
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Contoh: 2024"
              />
            </div>

            <div>
              <label htmlFor="periode" className="block text-sm font-medium text-gray-700">
                Periode <span className="text-red-500">*</span>
              </label>
              <select
                id="periode"
                name="periode"
                required
                value={formData.periode}
                onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">Pilih Periode</option>
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
                <option value="Antara">Antara</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'nonaktif' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div>
              <label htmlFor="tanggalMulai" className="block text-sm font-medium text-gray-700">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                id="tanggalMulai"
                name="tanggalMulai"
                type="date"
                required
                value={formData.tanggalMulai}
                onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="tanggalSelesai" className="block text-sm font-medium text-gray-700">
                Tanggal Selesai <span className="text-red-500">*</span>
              </label>
              <input
                id="tanggalSelesai"
                name="tanggalSelesai"
                type="date"
                required
                value={formData.tanggalSelesai}
                onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
            <Link
              href={ROUTES.ADMIN.SEMESTER_ANTARA}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

