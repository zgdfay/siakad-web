'use client';

import { useRef, useState, useEffect } from 'react';
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

export default function ManajemenUserPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (roleFilter !== 'all') params.set('role', roleFilter);

      const response = await fetch(`/api/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data user');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal mengambil data user', {
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term untuk mengurangi API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter]);

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

  const handleSubmitUser = async (values: UserFormValues) => {
    try {
      if (dialogMode === 'create') {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nimOrNip: values.nimOrNip,
            name: values.name,
            email: values.email?.trim() || undefined, // Only send if provided and not empty
            role: values.role,
            status: values.status,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal menambahkan user');
        }

        toast.success('User berhasil ditambahkan');
        fetchUsers(); // Refresh list
      } else if (dialogMode === 'edit' && editingUser) {
        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nimOrNip: values.nimOrNip,
            name: values.name,
            email: values.email?.trim() || undefined, // Only send if provided and not empty
            role: values.role,
            status: values.status,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal memperbarui user');
        }

        toast.success('User berhasil diperbarui');
        fetchUsers(); // Refresh list
      }
      setUserDialogOpen(false);
    } catch (error) {
      console.error('Error submitting user:', error);
      toast.error('Gagal menyimpan user', {
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
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
    reader.onload = async () => {
      const text = reader.result as string;
      const importedUsers = parseCsv(text);

      if (importedUsers.length === 0) {
        toast.error('Tidak ada data user yang dapat diimpor');
        setImporting(false);
        return;
      }

      // Import users via API (batch create)
      try {
        let successCount = 0;
        let errorCount = 0;

        for (const user of importedUsers) {
          try {
            const response = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                nimOrNip: user.nimOrNip,
                name: user.name,
                email: user.email || undefined,
                role: user.role,
                status: user.status,
              }),
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }

        if (successCount > 0) {
          toast.success('Import berhasil', {
            description: `${successCount} user berhasil ditambahkan${
              errorCount > 0 ? `, ${errorCount} gagal` : ''
            }`,
          });
          fetchUsers(); // Refresh list
        } else {
          toast.error('Import gagal', {
            description: 'Semua user gagal ditambahkan',
          });
        }
      } catch (error) {
        toast.error('Gagal mengimpor user', {
          description:
            error instanceof Error ? error.message : 'Terjadi kesalahan',
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

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus user');
      }

      toast.success('User berhasil dihapus');
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus user', {
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
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
            {loading ? 'Memuat...' : `${users.length} user ditemukan`}
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
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Tidak ada user yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
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
