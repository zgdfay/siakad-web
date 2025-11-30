import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    icon: 'fa-solid fa-graduation-cap',
    title: 'Pendaftaran Semester Antara',
    description:
      'Daftarkan mata kuliah semester antara dengan mudah dan cepat melalui sistem online.',
  },
  {
    icon: 'fa-solid fa-credit-card',
    title: 'Pembayaran Online',
    description:
      'Lakukan pembayaran dengan berbagai metode pembayaran yang tersedia secara online.',
  },
  {
    icon: 'fa-solid fa-file-invoice',
    title: 'SPK Digital',
    description:
      'Download Surat Perintah Kuliah (SPK) secara digital setelah pembayaran dikonfirmasi.',
  },
  {
    icon: 'fa-solid fa-chart-line',
    title: 'Riwayat Pendaftaran',
    description:
      'Lihat dan kelola riwayat pendaftaran Anda dengan mudah di satu tempat.',
  },
  {
    icon: 'fa-solid fa-calendar-days',
    title: 'Kalender Akademik',
    description:
      'Akses informasi kalender akademik dan jadwal penting semester.',
  },
  {
    icon: 'fa-solid fa-shield-halved',
    title: 'Keamanan Data',
    description:
      'Data Anda terlindungi dengan sistem keamanan yang terjamin.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Fitur Unggulan
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nikmati kemudahan dalam mengelola administrasi akademik dengan
            fitur-fitur lengkap yang kami sediakan.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <i className={`${feature.icon} text-2xl text-primary`}></i>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

