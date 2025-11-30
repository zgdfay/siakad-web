'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  nip: string;
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function PengaturanPage() {
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalData, setOriginalData] = useState<AccountFormData | null>(
    null
  );
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    formState: { errors: accountErrors },
    reset: resetAccount,
    watch: watchAccount,
  } = useForm<AccountFormData>({
    defaultValues: {
      nip: '',
      name: '',
      email: '',
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
  const currentPassword = watchPassword('currentPassword');
  const confirmPassword = watchPassword('confirmPassword');
  const accountData = watchAccount();

  // Load data saat component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const response = await fetch('/api/auth/profile');
        if (!response.ok) {
          throw new Error('Gagal mengambil data profil');
        }
        const data = await response.json();
        const initialData = {
          nip: data.user.nim || '',
          name: data.user.name || '',
          email: data.user.email || '',
        };
        resetAccount(initialData);
        setOriginalData(initialData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Gagal mengambil data profil', {
          description: 'Terjadi kesalahan saat memuat data',
        });
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [resetAccount]);

  // Check if account form has changes
  const hasAccountChanges =
    originalData &&
    accountData &&
    ((accountData.name?.trim() || '') !== (originalData.name?.trim() || '') ||
      (accountData.email?.trim() || '') !== (originalData.email?.trim() || ''));

  // Check if password form is filled
  const isPasswordFormFilled =
    currentPassword?.trim() && newPassword?.trim() && confirmPassword?.trim();

  const onSubmitAccount = async (data: AccountFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memperbarui profil');
      }

      const result = await response.json();

      // Update form dengan data terbaru
      const updatedData = {
        nip: data.nip,
        name: result.user.name,
        email: result.user.email,
      };
      resetAccount(updatedData);
      setOriginalData(updatedData);

      toast.success('Profil berhasil diperbarui', {
        description: 'Data profil Anda telah berhasil diupdate',
      });
    } catch (error: any) {
      toast.error('Gagal memperbarui profil', {
        description: error.message || 'Terjadi kesalahan saat memperbarui data',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setPasswordLoading(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengubah password');
      }

      toast.success('Password berhasil diubah', {
        description: 'Password Anda telah berhasil diupdate',
      });

      resetPassword();
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      toast.error('Gagal mengubah password', {
        description:
          error.message || 'Password lama tidak sesuai atau terjadi kesalahan',
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
              Perbarui informasi profil Anda. NIP tidak dapat diubah.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Memuat data...
                </div>
              </div>
            ) : (
              <form className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nip">NIP</Label>
                    <Input
                      id="nip"
                      type="text"
                      {...registerAccount('nip')}
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      NIP tidak dapat diubah. Hubungi super admin jika perlu
                      perubahan.
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
                  <Button
                    type="button"
                    onClick={handleSubmitAccount(onSubmitAccount)}
                    disabled={loading || fetching || !hasAccountChanges}
                    size="lg">
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </Button>
                </div>
              </form>
            )}
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
                  <Label htmlFor="confirmPassword">
                    Konfirmasi Password Baru
                  </Label>
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
                <AlertDialog
                  open={isPasswordDialogOpen}
                  onOpenChange={setIsPasswordDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={passwordLoading || !isPasswordFormFilled}
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                      {passwordLoading ? 'Mengubah...' : 'Ubah Password'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Pengaturan Akun</AlertDialogTitle>
                      <AlertDialogDescription>
                        Pastikan Anda mengingat password baru. Anda akan
                        menggunakan password ini untuk login berikutnya.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={passwordLoading}>
                        Batal
                      </AlertDialogCancel>
                      <AlertDialogAction
                        type="button"
                        onClick={handleSubmitPassword(onSubmitPassword)}
                        disabled={passwordLoading}
                        className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                        {passwordLoading ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                            Mengubah...
                          </>
                        ) : (
                          'Ya, Ubah Password'
                        )}
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

