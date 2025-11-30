'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-linear-to-br from-primary/5 via-background to-primary/5 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Meningkatkan efisiensi di seluruh proses <br />
            <span className="text-primary">Administrasi Akademik</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Maksimalkan inovasi dan optimalisasi melalui platform kami.
            Tingkatkan efektivitas operasional dan berikan pengalaman terbaik
            bagi mahasiswa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => router.push(ROUTES.AUTH.REGISTER)}
              className="w-full sm:w-auto text-base px-8 py-6">
              Mulai Sekarang
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const faqSection = document.getElementById('faq');
                if (faqSection) {
                  faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="w-full sm:w-auto text-base px-8 py-6">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-6xl mx-auto">
          <div className="relative rounded-2xl border border-border/50 bg-white shadow-2xl overflow-hidden">
            {/* Gradient Glow Effect */}
            <div className="absolute -inset-1 bg-linear-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-2xl opacity-50 -z-10"></div>

            {/* Dashboard Image */}
            <div className="relative w-full aspect-video">
              <Image
                src="/hero-landing/hero-image.png"
                alt="Dashboard Preview - Sistem Informasi Akademik"
                fill
                className="object-contain"
                priority
                quality={90}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
