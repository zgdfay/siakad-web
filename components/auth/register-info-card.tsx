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
      <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br from-primary via-primary/90 to-primary/80 p-6 lg:p-8 min-h-[400px] lg:min-h-[500px] flex items-center">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-white/10 blur-3xl"></div>

        {/* Info Card */}
        <div className="relative z-10 w-full">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg">
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

