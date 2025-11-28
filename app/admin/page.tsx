export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-gray-600">
          Selamat datang di panel administrasi Siakad
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Semester Antara</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          <p className="mt-1 text-xs text-gray-500">Aktif</p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Mahasiswa Terdaftar</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          <p className="mt-1 text-xs text-gray-500">Semester Antara</p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Mata Kuliah</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          <p className="mt-1 text-xs text-gray-500">Tersedia</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Semester Antara Terbaru
        </h2>
        <div className="text-center py-8 text-gray-500">
          <p>Belum ada data semester antara</p>
          <a
            href="/admin/semester-antara/tambah"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Tambah Semester Antara
          </a>
        </div>
      </div>
    </div>
  );
}

