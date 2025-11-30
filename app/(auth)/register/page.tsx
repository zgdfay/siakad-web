'use client';

import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/register-form';
import { RegisterInfoCard } from '@/components/auth/register-info-card';
import { AcademicCalendar } from '@/components/academic/academic-calendar';
import { ROUTES } from '@/lib/routes';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (data: {
    nim: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nim: data.nim,
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server mengembalikan response yang tidak valid. Silakan coba lagi.');
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Terjadi kesalahan saat mendaftar');
    }

    // Session cookie sudah di-set oleh API (auto-login setelah register)
    // Redirect berdasarkan role
    if (result.user.role === 'ADMIN') {
      router.push(ROUTES.ADMIN.DASHBOARD);
    } else if (result.user.role === 'DOSEN') {
      router.push('/dosen');
    } else {
      router.push(ROUTES.MAHASISWA.DASHBOARD);
    }
    router.refresh();
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = currentDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Side - Register Form */}
          <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
            <RegisterForm onSubmit={handleRegister} />
          </div>

          {/* Right Side - Info Card (Desktop) */}
          <div className="hidden lg:flex items-center justify-center">
            <RegisterInfoCard
              formattedDate={formattedDate}
              formattedTime={formattedTime}
            />
          </div>
        </div>

        {/* Info Card (Mobile) - Below Register Form */}
        <div className="lg:hidden mt-6 sm:mt-8">
          <RegisterInfoCard
            formattedDate={formattedDate}
            formattedTime={formattedTime}
          />
        </div>

        {/* Academic Calendar Section */}
        <AcademicCalendar />
      </div>
    </>
  );
}
