'use client';

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
