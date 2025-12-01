'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/login-form';
import { InfoCard } from '@/components/auth/info-card';
import { AcademicCalendar } from '@/components/academic/academic-calendar';
import { ROUTES } from '@/lib/routes';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (data: { nim: string; password: string }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nim: data.nim,
        password: data.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'NIM atau password salah');
    }

    // Session cookie sudah di-set oleh API, tidak perlu localStorage
    // Redirect berdasarkan role
    if (result.user.role === 'ADMIN') {
      router.push(ROUTES.ADMIN.DASHBOARD);
    } else if (result.user.role === 'DOSEN') {
      router.push('/dosen'); // TODO: Buat halaman dosen jika diperlukan
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
          {/* Left Side - Login Form */}
          <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
            <LoginForm onSubmit={handleLogin} />
          </div>

          {/* Right Side - Hero Image (Desktop) */}
          <div className="hidden lg:flex items-center justify-center mt-6 sm:mt-8">
            <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/hero/hero-image.jpg"
                alt="ITB YADIKA Pasuruan"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Academic Calendar Section */}
        <AcademicCalendar />
      </div>
    </>
  );
}
