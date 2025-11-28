'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    clearErrors,
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  // Auto-dismiss errors setelah 5 detik
  useEffect(() => {
    if (errors.name || errors.email || errors.password || errors.confirmPassword) {
      const timer = setTimeout(() => {
        clearErrors();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors.name, errors.email, errors.password, errors.confirmPassword, clearErrors]);

  // Auto-dismiss error message setelah 5 detik
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmitForm = async (data: RegisterFormData) => {
    setError('');
    setLoading(true);

    try {
      // TODO: Implementasi logika register
      console.log('Register attempt:', data);
      
      // Simulasi register
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Pendaftaran berhasil!', {
        description: 'Akun Anda telah berhasil dibuat',
      });
      
      // Redirect ke login setelah register berhasil
      router.push('/auth/login');
    } catch (err) {
      const errorMessage = 'Terjadi kesalahan saat mendaftar';
      setError(errorMessage);
      toast.error('Pendaftaran gagal', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-md mx-auto">
        <div className="w-full space-y-5 sm:space-y-6 px-2 sm:px-0">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Daftar Akun
            </h2>
            <p className="text-sm text-muted-foreground">
              Buat akun baru untuk mengakses Siakad
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
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
                  <p className="text-sm text-destructive">{errors.password.message}</p>
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

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </Button>
            </div>
            
            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline">
                Sudah punya akun? Masuk di sini
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
