'use client';

import { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  UserFormDialog,
  UserFormValues,
} from '@/components/admin/user-form-dialog';

interface UserItem {
  id: string;
  nimOrNip: string;
  name: string;
  email: string;
  role: 'mahasiswa' | 'dosen' | 'admin';
  status: 'aktif' | 'nonaktif';
}

// Mock data - akan diganti dengan data dari API
const mockUsers: UserItem[] = [
  {
    id: '1',
    nimOrNip: '202410001',
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@mhs.itbyadika.ac.id',
    role: 'mahasiswa',
    status: 'aktif',
  },
  {
    id: '2',
    nimOrNip: 'D001',
    name: 'Dr. Siti Nurhaliza',
    email: 'siti.nurhaliza@itbyadika.ac.id',
    role: 'dosen',
    status: 'aktif',
  },
  {
    id: '3',
    nimOrNip: 'ADM01',
    name: 'Admin Akademik',
    email: 'admin@itbyadika.ac.id',
    role: 'admin',
    status: 'aktif',
  },
];

export default function ManajemenUserPage() {
  const [users, setUsers] = useState<UserItem[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nimOrNip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const handleOpenCreate = () => {
    setDialogMode('create');
    setEditingUser(null);
    setUserDialogOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setDialogMode('edit');
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const handleSubmitUser = (values: UserFormValues) => {
    if (dialogMode === 'create') {
      const newUser: UserItem = {
        id: crypto.randomUUID(),
        nimOrNip: values.nimOrNip,
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
      };
      setUsers((prev) => [...prev, newUser]);
      toast.success('User berhasil ditambahkan');
    } else if (dialogMode === 'edit' && editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                nimOrNip: values.nimOrNip,
                name: values.name,
                email: values.email,
                role: values.role,
                status: values.status,
              }
            : u
        )
      );
      toast.success('User berhasil diperbarui');
    }
    setUserDialogOpen(false);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const parseCsv = (content: string): UserItem[] => {
    const lines = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length <= 1) return [];

    // Deteksi delimiter (mendukung koma atau titik koma)
    const delimiter = lines[0].includes(';') ? ';' : ',';

    const header = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
    const nimIdx =
      header.indexOf('nimornip') !== -1
        ? header.indexOf('nimornip')
        : header.indexOf('nim_or_nip') !== -1
        ? header.indexOf('nim_or_nip')
        : header.indexOf('nim');
    const nameIdx =
      header.indexOf('name') !== -1
        ? header.indexOf('name')
        : header.indexOf('nama');
    const roleIdx = header.indexOf('role');

    if (nimIdx === -1 || nameIdx === -1 || roleIdx === -1) {
      toast.error('Format CSV tidak valid', {
        description:
          'Pastikan header berisi nim/nimOrNip, name/nama, dan role (mahasiswa/dosen/admin)',
      });
      return [];
    }

    const rows = lines.slice(1);
    const imported: UserItem[] = [];

    for (const row of rows) {
      const cols = row.split(delimiter).map((c) => c.trim());
      if (!cols[nimIdx] || !cols[nameIdx] || !cols[roleIdx]) continue;

      const roleValue = cols[roleIdx].toLowerCase();
      if (!['mahasiswa', 'dosen', 'admin'].includes(roleValue)) continue;

      imported.push({
        id: crypto.randomUUID(),
        nimOrNip: cols[nimIdx],
        name: cols[nameIdx],
        // Email tidak diambil dari file; bisa diisi/edit manual lewat form
        email: '',
        role: roleValue as UserItem['role'],
        // Status default aktif, dapat diubah lewat modal edit
        status: 'aktif',
      });
    }

    return imported;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.toLowerCase().endsWith('.csv');
    const isExcel =
      file.name.toLowerCase().endsWith('.xls') ||
      file.name.toLowerCase().endsWith('.xlsx');

    if (!isCsv && !isExcel) {
      toast.error('Format file tidak didukung', {
        description: 'Gunakan file CSV (disarankan) atau Excel.',
      });
      return;
    }

    if (isExcel) {
      toast.error('Import Excel belum didukung', {
        description:
          'Untuk saat ini, silakan ekspor data ke CSV terlebih dahulu.',
      });
      return;
    }

    setImporting(true);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const importedUsers = parseCsv(text);

      if (importedUsers.length === 0) {
        toast.error('Tidak ada data user yang dapat diimpor');
      } else {
        setUsers((prev) => [...prev, ...importedUsers]);
        toast.success('Import berhasil', {
          description: `${importedUsers.length} user berhasil ditambahkan dari CSV`,
        });
      }

      setImporting(false);
    };
    reader.onerror = () => {
      toast.error('Gagal membaca file', {
        description: 'Periksa kembali file dan coba lagi.',
      });
      setImporting(false);
    };

    reader.readAsText(file);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success('User berhasil dihapus');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Manajemen User
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola akun mahasiswa, dosen, dan admin yang dapat mengakses sistem
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleOpenCreate}>
            Tambah User
          </Button>
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleImportClick}
            disabled={importing}>
            {importing ? 'Mengimpor...' : 'Import CSV / Excel'}
          </Button>
        </div>
      </div>

      {/* Filter & Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar User</CardTitle>
          <CardDescription>
            {filteredUsers.length} user ditemukan dari {mockUsers.length} data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
            <Input
              placeholder="Cari berdasarkan nama, email, atau NIM/NIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 md:flex-1"
            />
            <div className="w-full md:w-56">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                  <SelectItem value="dosen">Dosen</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabel user */}
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    NIM / NIP
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Nama
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Tidak ada user yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {user.nimOrNip}
                      </td>
                      <td className="px-4 py-3 text-foreground">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">
                        {user.role}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            user.status === 'aktif'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }>
                          {user.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex flex-wrap gap-2 text-xs justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(user)}>
                            <i className="fa-solid fa-pen mr-1"></i>
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive">
                                <i className="fa-solid fa-trash mr-1"></i>
                                Hapus
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Hapus user ini?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Data user akan dihapus dari daftar. Tindakan
                                  ini tidak dapat dibatalkan (simulasi untuk
                                  mock data).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleDeleteUser(user.id)}>
                                  Ya, Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <UserFormDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        mode={dialogMode}
        initialData={
          editingUser
            ? {
                id: editingUser.id,
                nimOrNip: editingUser.nimOrNip,
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
                status: editingUser.status,
              }
            : null
        }
        onSubmit={handleSubmitUser}
      />

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
