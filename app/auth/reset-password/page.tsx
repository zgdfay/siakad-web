'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
          <ResetPasswordForm token={token || undefined} />
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

