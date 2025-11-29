'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';

interface LoginFormData {
  nim: string;
  password: string;
}

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void>;
  onSuccess?: () => void;
  forgotPasswordLink?: string;
  title?: string;
}

export function LoginForm({
  onSubmit,
  onSuccess,
  forgotPasswordLink = '/auth/forgot-password',
  title = 'Portal Mahasiswa',
}: LoginFormProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-dismiss error message setelah 5 detik
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<LoginFormData>({
    defaultValues: {
      nim: '',
      password: '',
    },
  });

  // Auto-dismiss errors setelah 5 detik
  useEffect(() => {
    if (errors.nim || errors.password) {
      const timer = setTimeout(() => {
        clearErrors();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors.nim, errors.password, clearErrors]);

  const onSubmitForm = async (data: LoginFormData) => {
    setError('');
    setLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(data);
        toast.success('Login berhasil!', {
          description: 'Selamat datang kembali',
        });
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'NIM atau password salah';
      setError(errorMessage);
      toast.error('Login gagal', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-5 sm:space-y-6 px-2 sm:px-0">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {title}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="space-y-4 sm:space-y-5">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nim">Masukkan NIM</Label>
            <Input
              id="nim"
              type="text"
              {...register('nim', {
                required: 'NIM wajib diisi',
                minLength: {
                  value: 3,
                  message: 'NIM minimal 3 karakter',
                },
              })}
              placeholder="Masukkan NIM"
              className="h-11"
            />
            {errors.nim && (
              <p className="text-sm text-destructive">{errors.nim.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Masukkan password</Label>
            <PasswordInput
              id="password"
              {...register('password', {
                required: 'Password wajib diisi',
                minLength: {
                  value: 6,
                  message: 'Password minimal 6 karakter',
                },
              })}
              placeholder="Masukkan password"
              className="h-11"
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href={forgotPasswordLink}
            className="text-sm text-primary hover:underline">
            Lupa Password ?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold"
          size="lg">
          {loading ? 'Memproses...' : 'Login'}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Belum punya akun? </span>
          <Link
            href="/auth/register"
            className="text-primary hover:underline font-medium">
            Daftar
          </Link>
        </div>
      </form>
    </div>
  );
}
