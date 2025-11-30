'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: 'fa-solid fa-graduation-cap',
    title: 'Pendaftaran Semester Antara',
    description:
      'Daftarkan mata kuliah semester antara dengan mudah dan cepat melalui sistem online. Pilih mata kuliah, lengkapi data, dan submit dalam hitungan menit.',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    span: 'md:col-span-2 lg:col-span-3', // Wide card - baris atas
  },
  {
    icon: 'fa-solid fa-credit-card',
    title: 'Pembayaran Online',
    description:
      'Lakukan pembayaran dengan berbagai metode pembayaran yang tersedia secara online. Upload bukti pembayaran dan tunggu konfirmasi dari admin.',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    span: 'md:col-span-2 lg:col-span-3', // Wide card - baris atas
  },
  {
    icon: 'fa-solid fa-file-invoice',
    title: 'SPK Digital',
    description:
      'Download Surat Perintah Kuliah (SPK) secara digital setelah pembayaran dikonfirmasi. Dokumen resmi yang dapat diunduh kapan saja.',
    iconColor: 'text-green-500',
    iconBg: 'bg-green-500/10',
    span: 'md:col-span-1 lg:col-span-2', // Kotak - baris bawah
  },
  {
    icon: 'fa-solid fa-chart-line',
    title: 'Riwayat Pendaftaran',
    description:
      'Lihat dan kelola riwayat pendaftaran Anda dengan mudah di satu tempat. Track status pendaftaran dari awal hingga selesai.',
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-500/10',
    span: 'md:col-span-1 lg:col-span-2', // Kotak - baris bawah
  },
  {
    icon: 'fa-solid fa-shield-halved',
    title: 'Keamanan Data',
    description:
      'Data Anda terlindungi dengan sistem keamanan yang terjamin. Enkripsi data dan akses terbatas untuk menjaga privasi Anda.',
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/10',
    span: 'md:col-span-1 lg:col-span-2', // Kotak - baris bawah
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 px-3 py-1 text-xs font-medium">
              Fitur Unggulan
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Mengelola Administrasi Akademik dengan Mudah
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Nikmati kemudahan dalam mengelola administrasi akademik dengan
              fitur-fitur lengkap yang kami sediakan untuk pengalaman terbaik.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`${feature.span} hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group`}>
                <CardContent className="p-6 h-full">
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <i
                      className={`${feature.icon} text-2xl ${feature.iconColor}`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
