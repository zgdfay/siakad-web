'use client';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    value: '100%',
    label: 'Digital',
    icon: 'fa-solid fa-cloud',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
  },
  {
    value: '24/7',
    label: 'Akses',
    icon: 'fa-solid fa-clock',
    iconColor: 'text-green-500',
    iconBg: 'bg-green-500/10',
  },
  {
    value: 'Real-time',
    label: 'Notifikasi',
    icon: 'fa-solid fa-bell',
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-500/10',
  },
  {
    value: 'Aman',
    label: 'Terpercaya',
    icon: 'fa-solid fa-shield-halved',
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/10',
  },
];

const benefits = [
  {
    title: 'Proses Cepat & Efisien',
    description:
      'Pendaftaran dan pembayaran dapat dilakukan dalam hitungan menit tanpa perlu antri atau datang ke kampus.',
    icon: 'fa-solid fa-bolt',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
  },
  {
    title: 'Akses Kapan Saja',
    description:
      'Sistem dapat diakses 24/7 dari mana saja, memberikan fleksibilitas maksimal untuk mahasiswa.',
    icon: 'fa-solid fa-globe',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
  },
  {
    title: 'Notifikasi Real-time',
    description:
      'Dapatkan notifikasi instan tentang status pendaftaran, pembayaran, dan informasi penting lainnya.',
    icon: 'fa-solid fa-bell',
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-500/10',
  },
  {
    title: 'Dokumen Digital',
    description:
      'Semua dokumen seperti SPK dan Invoice tersedia dalam format digital yang mudah diunduh dan diakses.',
    icon: 'fa-solid fa-file-pdf',
    iconColor: 'text-green-500',
    iconBg: 'bg-green-500/10',
  },
];

export function AboutSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 px-3 py-1 text-xs font-medium">
              Tentang Sistem
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Platform Digital Terintegrasi untuk Administrasi Akademik
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sistem Informasi Akademik 4.0 adalah platform digital terintegrasi
              yang dirancang khusus untuk memudahkan mahasiswa dalam mengelola
              administrasi akademik, khususnya untuk pendaftaran semester antara.
              Dengan teknologi terkini, kami menghadirkan solusi yang efisien,
              aman, dan mudah digunakan.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="text-center border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
                <CardContent className="pt-6 pb-6">
                  <div
                    className={`w-14 h-14 rounded-xl ${stat.iconBg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <i className={`${stat.icon} text-xl ${stat.iconColor}`}></i>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl ${benefit.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <i
                        className={`${benefit.icon} text-xl ${benefit.iconColor}`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

