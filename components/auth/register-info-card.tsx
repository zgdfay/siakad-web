'use client';

interface RegisterInfoCardProps {
  formattedDate: string;
  formattedTime: string;
}

export function RegisterInfoCard({
  formattedDate,
  formattedTime,
}: RegisterInfoCardProps) {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:mx-0">
      <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden bg-background p-6 lg:p-8 min-h-[400px] lg:min-h-[500px] flex items-center">
        {/* Mesh Gradient Background - Blue Only */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Blob 1 - Top Right */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
          {/* Blob 2 - Bottom Left */}
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/30 rounded-full blur-3xl"></div>
          {/* Blob 3 - Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          {/* Blob 4 - Top Left */}
          <div className="absolute top-10 left-10 w-48 h-48 bg-blue-500/25 rounded-full blur-2xl"></div>
          {/* Blob 5 - Bottom Right */}
          <div className="absolute bottom-10 right-10 w-56 h-56 bg-blue-600/25 rounded-full blur-2xl"></div>
        </div>

        {/* Info Card */}
        <div className="relative z-10 w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fa-solid fa-user-plus text-primary"></i>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Informasi Pendaftaran
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <i className="fa-solid fa-calendar text-primary"></i>
                <span>
                  {formattedDate} | {formattedTime}
                </span>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-xs sm:text-sm text-foreground leading-relaxed">
                <p className="font-medium mb-2">Persyaratan Pendaftaran:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-2">
                  <li>
                    <strong>NIM:</strong> Masukkan NIM yang terdaftar di kampus
                  </li>
                  <li>
                    <strong>Nama Lengkap:</strong> Sesuai dengan data akademik
                  </li>
                  <li>
                    <strong>Email:</strong> Gunakan email aktif untuk verifikasi
                  </li>
                  <li>
                    <strong>Password:</strong> Minimal 6 karakter, gunakan kombinasi huruf dan angka
                  </li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Setelah pendaftaran berhasil, Anda dapat langsung login menggunakan NIM dan password yang telah dibuat.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Jika mengalami kendala, silakan hubungi administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

