'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { InfoCard } from '@/components/auth/info-card';
import { AcademicCalendar } from '@/components/academic/academic-calendar';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (data: { nim: string; password: string }) => {
    // TODO: Implementasi logika login
    console.log('Login attempt:', data);

    // Simulasi login
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect ke admin setelah login berhasil
    router.push('/admin');
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
          {/* Left Side - Login Form */}
          <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
            <LoginForm onSubmit={handleLogin} />
          </div>

          {/* Right Side - Info Card (Desktop) */}
          <div className="hidden lg:flex items-center justify-center">
            <InfoCard
              formattedDate={formattedDate}
              formattedTime={formattedTime}
            />
          </div>
        </div>

        {/* Info Card (Mobile) - Below Login Form */}
        <div className="lg:hidden mt-6 sm:mt-8">
          <InfoCard
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
