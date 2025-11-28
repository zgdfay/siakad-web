import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-gray-800 px-6">
            <h1 className="text-xl font-bold">Siakad Admin</h1>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-4">
            <Link
              href="/admin"
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/semester-antara"
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Semester Antara
            </Link>
            <Link
              href="/admin/semester-antara/tambah"
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Tambah Semester Antara
            </Link>
          </nav>
          
          <div className="border-t border-gray-800 p-4">
            <Link
              href="/auth/login"
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Keluar
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Panel Admin
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin</span>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

