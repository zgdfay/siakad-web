'use client';

import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/register-form';
import { RegisterInfoCard } from '@/components/auth/register-info-card';
import { AcademicCalendar } from '@/components/academic/academic-calendar';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (data: {
    nim: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    // TODO: Implementasi logika register
    console.log('Register attempt:', data);

    // Simulasi register
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect ke login setelah register berhasil
    router.push('/auth/login');
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
