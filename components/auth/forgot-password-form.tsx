'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  onBack?: () => void;
  onSuccess?: () => void;
  backLink?: string;
}

export function ForgotPasswordForm({
  onBack,
  onSuccess,
  backLink = '/auth/login',
}: ForgotPasswordFormProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    clearErrors,
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    },
  });

  const emailValue = watch('email');

  // Auto-dismiss errors setelah 5 detik
  useEffect(() => {
    if (errors.email) {
      const timer = setTimeout(() => {
        clearErrors();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors.email, clearErrors]);

  // Auto-dismiss error message setelah 5 detik
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmitForm = async (data: ForgotPasswordFormData) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat mengirim email reset password');
      }

      setSuccess(true);
      toast.success('Email terkirim!', {
        description: 'Link reset password telah dikirim ke email Anda',
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat mengirim email reset password';
      setError(errorMessage);
      toast.error('Gagal mengirim email', {
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
              Email Terkirim
            </h2>
            <p className="text-sm text-muted-foreground">
              Kami telah mengirimkan link reset password ke email{' '}
              <strong>{emailValue}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Silakan cek inbox atau folder spam Anda
            </p>
          </div>
          <Link href={backLink}>
            <Button variant="outline" className="w-full mt-4">
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
          Lupa Password
        </h2>
        <p className="text-sm text-muted-foreground">
          Masukkan email Anda untuk menerima link reset password
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

        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            {...register('email', {
              required: 'Email wajib diisi',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Format email tidak valid',
              },
            })}
            placeholder="Masukkan Email"
            className="h-11"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Kami akan mengirimkan link reset password ke email terdaftar Anda
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold"
            size="lg">
            {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
          </Button>

          <Link href={backLink}>
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
