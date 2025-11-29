'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  token?: string;
  onSuccess?: () => void;
  loginLink?: string;
}

export function ResetPasswordForm({
  token,
  onSuccess,
  loginLink = '/auth/login',
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Ambil token dari URL jika ada (akan diambil di page level)
  const tokenFromUrl = token;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    clearErrors,
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  // Auto-dismiss errors setelah 5 detik
  useEffect(() => {
    if (errors.password || errors.confirmPassword) {
      const timer = setTimeout(() => {
        clearErrors();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors.password, errors.confirmPassword, clearErrors]);

  // Auto-dismiss error message setelah 5 detik
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmitForm = async (data: ResetPasswordFormData) => {
    setError('');
    setLoading(true);

    try {
      // TODO: Implementasi logika reset password
      console.log('Reset password request:', {
        token: tokenFromUrl,
        password: data.password,
      });

      // Simulasi reset password
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
      toast.success('Password berhasil direset!', {
        description: 'Password Anda telah berhasil diubah',
      });

      if (onSuccess) {
        onSuccess();
      }

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        router.push(loginLink);
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat mereset password';
      setError(errorMessage);
      toast.error('Gagal mereset password', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md space-y-5 sm:space-y-6 px-2 sm:px-0">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <i className="fa-solid fa-check text-2xl text-green-600"></i>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Password Berhasil Direset
            </h2>
            <p className="text-sm text-muted-foreground">
              Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login.
            </p>
          </div>
          <Link href={loginLink}>
            <Button className="w-full mt-4">
              Kembali ke Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-5 sm:space-y-6 px-2 sm:px-0">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Reset Password
        </h2>
        <p className="text-sm text-muted-foreground">
          Masukkan password baru Anda
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="space-y-4 sm:space-y-5">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!tokenFromUrl && (
          <div className="rounded-lg border border-warning/50 bg-warning/10 p-3">
            <p className="text-sm text-warning-foreground">
              Token reset password tidak ditemukan. Pastikan Anda mengakses dari link yang benar.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-password">Password Baru</Label>
            <PasswordInput
              id="reset-password"
              {...register('password', {
                required: 'Password baru wajib diisi',
                minLength: {
                  value: 6,
                  message: 'Password minimal 6 karakter',
                },
              })}
              placeholder="Masukkan password baru"
              className="h-11"
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Gunakan kombinasi huruf dan angka untuk keamanan yang lebih baik
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-confirm-password">Konfirmasi Password Baru</Label>
            <PasswordInput
              id="reset-confirm-password"
              {...register('confirmPassword', {
                required: 'Konfirmasi password wajib diisi',
                validate: (value) =>
                  value === password || 'Password tidak cocok',
              })}
              placeholder="Konfirmasi password baru"
              className="h-11"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={loading || !tokenFromUrl}
            className="w-full h-12 text-base font-semibold"
            size="lg">
            {loading ? 'Memproses...' : 'Reset Password'}
          </Button>

          <Link href={loginLink}>
            <Button type="button" variant="ghost" className="w-full">
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Kembali ke Login
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

