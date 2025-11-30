import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const benefits = [
  {
    title: 'Proses Cepat',
    description:
      'Pendaftaran dan pembayaran dapat dilakukan dalam hitungan menit.',
  },
  {
    title: 'Akses 24/7',
    description: 'Sistem dapat diakses kapan saja dan di mana saja.',
  },
  {
    title: 'Notifikasi Real-time',
    description:
      'Dapatkan notifikasi terkini tentang status pendaftaran dan pembayaran.',
  },
  {
    title: 'Dokumen Digital',
    description:
      'Semua dokumen tersedia dalam format digital yang mudah diakses.',
  },
];

export function AboutSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl mb-4">
                Tentang Sistem
              </CardTitle>
              <CardDescription className="text-base">
                Sistem Informasi Akademik 4.0 adalah platform digital yang
                dirancang khusus untuk memudahkan mahasiswa dalam mengelola
                administrasi akademik, khususnya untuk pendaftaran semester
                antara.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-check text-primary"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

