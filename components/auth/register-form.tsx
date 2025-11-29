'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';

interface RegisterFormData {
  nim: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => Promise<void>;
  onSuccess?: () => void;
  loginLink?: string;
}

export function RegisterForm({
  onSubmit,
  onSuccess,
  loginLink = '/auth/login',
}: RegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [nimStatus, setNimStatus] = useState<{
    checking: boolean;
    exists: boolean | null;
    message: string;
    isActive?: boolean;
  }>({
    checking: false,
    exists: null,
    message: '',
    isActive: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    clearErrors,
  } = useForm<RegisterFormData>({
    defaultValues: {
      nim: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const nimValue = watch('nim');

  // Auto-dismiss errors setelah 5 detik
  useEffect(() => {
    if (
      errors.nim ||
      errors.name ||
      errors.email ||
      errors.password ||
      errors.confirmPassword
    ) {
      const timer = setTimeout(() => {
        clearErrors();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [
    errors.nim,
    errors.name,
    errors.email,
    errors.password,
    errors.confirmPassword,
    clearErrors,
  ]);


  // Check NIM real-time dengan debounce
  useEffect(() => {
    if (!nimValue || nimValue.trim().length < 3) {
      setNimStatus({ checking: false, exists: null, message: '' });
      return;
    }

    const checkNim = async () => {
      setNimStatus((prev) => ({ ...prev, checking: true }));
      try {
        const response = await fetch(`/api/auth/check-nim?nim=${encodeURIComponent(nimValue.trim())}`);
        const result = await response.json();

        if (response.ok) {
          setNimStatus({
            checking: false,
            exists: result.exists && result.canRegister !== false,
            message: result.message || '',
            isActive: result.isActive !== false,
          });
        } else {
          setNimStatus({
            checking: false,
            exists: false,
            message: result.message || 'Terjadi kesalahan saat memeriksa NIM',
            isActive: true,
          });
        }
      } catch (err) {
        setNimStatus({
          checking: false,
          exists: null,
          message: '',
          isActive: true,
        });
      }
    };

    const debounceTimer = setTimeout(checkNim, 500);
    return () => clearTimeout(debounceTimer);
  }, [nimValue]);

  const onSubmitForm = async (data: RegisterFormData) => {
    setLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(data);
        toast.success('Pendaftaran berhasil!', {
          description: 'Akun Anda telah berhasil dibuat',
        });
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat mendaftar';
      
      // Check if error is about inactive account
      if (errorMessage.includes('tidak aktif') || errorMessage.includes('NONAKTIF')) {
        toast.warning('Akun Tidak Aktif', {
          description: errorMessage,
          icon: '⚠️',
        });
      } else {
        toast.error('Pendaftaran gagal', {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-5 sm:space-y-6 px-2 sm:px-0">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Daftar Akun
        </h2>
        <p className="text-sm text-muted-foreground">
          Buat akun baru untuk mengakses Siakad
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="space-y-4 sm:space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nim">NIM</Label>
            <div className="relative">
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
                className="h-11 pr-10"
              />
              {nimValue && nimValue.trim().length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {nimStatus.checking ? (
                    <i className="fa-solid fa-spinner fa-spin text-muted-foreground"></i>
                  ) : nimStatus.exists === true && nimStatus.isActive ? (
                    <i className="fa-solid fa-check text-green-600 dark:text-green-400 opacity-70"></i>
                  ) : nimStatus.exists === true && !nimStatus.isActive ? (
                    <i className="fa-solid fa-triangle-exclamation text-yellow-600 dark:text-yellow-400 opacity-70"></i>
                  ) : nimStatus.exists === false ? (
                    <i className="fa-solid fa-xmark text-red-600 dark:text-red-400 opacity-70"></i>
                  ) : null}
                </div>
              )}
            </div>
            {errors.nim && (
              <p className="text-sm text-destructive">{errors.nim.message}</p>
            )}
            {nimStatus.message && !errors.nim && (
              <p
                className={`text-xs ${
                  nimStatus.exists && nimStatus.isActive
                    ? 'text-green-600 dark:text-green-400 opacity-80'
                    : nimStatus.exists && !nimStatus.isActive
                    ? 'text-yellow-600 dark:text-yellow-400 opacity-80'
                    : 'text-red-600 dark:text-red-400 opacity-80'
                }`}>
                {nimStatus.message}
              </p>
            )}
            {!nimStatus.message && !errors.nim && (
              <p className="text-xs text-muted-foreground">
                NIM akan digunakan untuk login ke sistem
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              type="text"
              {...register('name', {
                required: 'Nama lengkap wajib diisi',
                minLength: {
                  value: 3,
                  message: 'Nama minimal 3 karakter',
                },
              })}
              placeholder="Nama Lengkap"
              className="h-11"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email wajib diisi',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Format email tidak valid',
                },
              })}
              placeholder="nama@email.com"
              className="h-11"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Email digunakan untuk reset password dan notifikasi
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              {...register('password', {
                required: 'Password wajib diisi',
                minLength: {
                  value: 6,
                  message: 'Password minimal 6 karakter',
                },
              })}
              placeholder="••••••••"
              className="h-11"
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <PasswordInput
              id="confirmPassword"
              {...register('confirmPassword', {
                required: 'Konfirmasi password wajib diisi',
                validate: (value) =>
                  value === password || 'Password tidak cocok',
              })}
              placeholder="••••••••"
              className="h-11"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold"
          size="lg">
          {loading ? 'Memproses...' : 'Daftar'}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Sudah punya akun? </span>
          <Link
            href={loginLink}
            className="text-primary hover:underline font-medium">
            Masuk
          </Link>
        </div>
      </form>
    </div>
  );
}
