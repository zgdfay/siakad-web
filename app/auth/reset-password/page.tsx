'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  // Jika tidak ada token atau error, tampilkan pesan
  if (!token || error === 'invalid_token') {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-triangle-exclamation text-destructive text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Link Tidak Valid</h2>
              <p className="text-muted-foreground">
                Link reset password tidak valid atau sudah kedaluwarsa. Silakan request link baru.
              </p>
              <div className="pt-4">
                <Button asChild>
                  <Link href="/auth/forgot-password">Request Link Baru</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
            <div className="text-center">
              <p className="text-muted-foreground">Memuat...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

