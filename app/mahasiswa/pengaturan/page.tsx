'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

interface AccountFormData {
  nim: string;
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Mock data - akan diganti dengan data dari API/session
const mockUserData = {
  nim: '202410001',
  name: 'Ahmad Fauzi',
  email: 'ahmad.fauzi@mhs.itbyadika.ac.id',
};

export default function PengaturanPage() {
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    formState: { errors: accountErrors },
    reset: resetAccount,
  } = useForm<AccountFormData>({
    defaultValues: {
      nim: mockUserData.nim,
      name: mockUserData.name,
      email: mockUserData.email,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    watch: watchPassword,
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watchPassword('newPassword');

  // Load data saat component mount
  useEffect(() => {
    // TODO: Fetch data dari API
    resetAccount({
      nim: mockUserData.nim,
      name: mockUserData.name,
      email: mockUserData.email,
    });
  }, [resetAccount]);

  const onSubmitAccount = async (data: AccountFormData) => {
    setLoading(true);
    try {
      // TODO: Update data ke API
      console.log('Update account:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Profil berhasil diperbarui', {
        description: 'Data profil Anda telah berhasil diupdate',
      });
    } catch (error) {
      toast.error('Gagal memperbarui profil', {
        description: 'Terjadi kesalahan saat memperbarui data',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setPasswordLoading(true);
    try {
      // TODO: Update password ke API
      console.log('Update password');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Password berhasil diubah', {
        description: 'Password Anda telah berhasil diupdate',
      });

      resetPassword();
    } catch (error) {
      toast.error('Gagal mengubah password', {
        description: 'Password lama tidak sesuai atau terjadi kesalahan',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Pengaturan Akun
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola informasi akun dan keamanan Anda
          </p>
        </div>

        {/* Informasi Akun */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>
              Perbarui informasi profil Anda. NIM tidak dapat diubah.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nim">NIM</Label>
                  <Input
                    id="nim"
                    type="text"
                    {...registerAccount('nim')}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    NIM tidak dapat diubah. Hubungi admin jika perlu perubahan.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    type="text"
                    {...registerAccount('name', {
                      required: 'Nama lengkap wajib diisi',
                      minLength: {
                        value: 3,
                        message: 'Nama minimal 3 karakter',
                      },
                    })}
                    placeholder="Masukkan nama lengkap"
                    className="h-11"
                  />
                  {accountErrors.name && (
                    <p className="text-sm text-destructive">
                      {accountErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerAccount('email', {
                      required: 'Email wajib diisi',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Format email tidak valid',
                      },
                    })}
                    placeholder="nama@email.com"
                    className="h-11"
                  />
                  {accountErrors.email && (
                    <p className="text-sm text-destructive">
                      {accountErrors.email.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Email digunakan untuk notifikasi dan reset password
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" disabled={loading} size="lg">
                      {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Simpan perubahan profil?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Perubahan nama dan email akan digunakan untuk data akun Anda ke depan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        type="button"
                        onClick={handleSubmitAccount(onSubmitAccount)}
                        className="bg-red-600 hover:bg-red-700 text-white">
                        Ya, Simpan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Ubah Password */}
        <Card>
          <CardHeader>
            <CardTitle>Ubah Password</CardTitle>
            <CardDescription>
              Pastikan password Anda kuat dan tidak mudah ditebak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <PasswordInput
                    id="currentPassword"
                    {...registerPassword('currentPassword', {
                      required: 'Password saat ini wajib diisi',
                    })}
                    placeholder="Masukkan password saat ini"
                    className="h-11"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <PasswordInput
                    id="newPassword"
                    {...registerPassword('newPassword', {
                      required: 'Password baru wajib diisi',
                      minLength: {
                        value: 6,
                        message: 'Password minimal 6 karakter',
                      },
                    })}
                    placeholder="Masukkan password baru"
                    className="h-11"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <PasswordInput
                    id="confirmPassword"
                    {...registerPassword('confirmPassword', {
                      required: 'Konfirmasi password wajib diisi',
                      validate: (value) =>
                        value === newPassword || 'Password tidak cocok',
                    })}
                    placeholder="Konfirmasi password baru"
                    className="h-11"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={passwordLoading}
                      variant="outline"
                      size="lg">
                      {passwordLoading ? 'Mengubah...' : 'Ubah Password'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ubah password akun?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Pastikan Anda mengingat password baru. Anda akan menggunakan password ini untuk login berikutnya.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        type="button"
                        onClick={handleSubmitPassword(onSubmitPassword)}
                        className="bg-red-600 hover:bg-red-700 text-white">
                        Ya, Ubah Password
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informasi Keamanan */}
        <Card>
          <CardHeader>
            <CardTitle>Keamanan Akun</CardTitle>
            <CardDescription>
              Tips untuk menjaga keamanan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-shield-halved text-primary mt-0.5"></i>
                <div>
                  <p className="font-medium">Gunakan Password yang Kuat</p>
                  <p className="text-muted-foreground">
                    Gunakan kombinasi huruf, angka, dan karakter khusus
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-lock text-primary mt-0.5"></i>
                <div>
                  <p className="font-medium">Jangan Bagikan Password</p>
                  <p className="text-muted-foreground">
                    Jangan pernah membagikan password Anda kepada siapapun
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-rotate text-primary mt-0.5"></i>
                <div>
                  <p className="font-medium">Ubah Password Secara Berkala</p>
                  <p className="text-muted-foreground">
                    Disarankan untuk mengubah password setiap 3-6 bulan sekali
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

