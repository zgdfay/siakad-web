'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/login-form';
import { InfoCard } from '@/components/auth/info-card';
import { AcademicCalendar } from '@/components/academic/academic-calendar';

export default function Home() {
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
      router.push('/admin');
    } else if (result.user.role === 'DOSEN') {
      router.push('/dosen'); // TODO: Buat halaman dosen jika diperlukan
    } else {
      router.push('/mahasiswa');
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                <Image
                  src="/logo/itb-yadika.png"
                  alt="ITB YADIKA PASURUAN"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                  SISTEM INFORMASI AKADEMIK 4.0
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Institut Teknologi dan Bisnis Yadika Pasuruan
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <a
                href="tel:+623434567890"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-xs sm:text-sm">
                <i className="fa-solid fa-phone text-[10px] sm:text-xs"></i>
                <span className="hidden sm:inline">(0343) 746000</span>
                <span className="sm:hidden">Telp</span>
              </a>
              <a
                href="mailto:info@itbyadika.ac.id"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-xs sm:text-sm">
                <i className="fa-solid fa-envelope text-[10px] sm:text-xs"></i>
                <span className="hidden sm:inline">info@itbyadika.ac.id</span>
                <span className="sm:hidden">Email</span>
              </a>
            </div>
          </div>
        </div>
      </header>

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
    </div>
  );
}
