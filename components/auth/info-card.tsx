'use client';

interface InfoCardProps {
  formattedDate: string;
  formattedTime: string;
}

export function InfoCard({ formattedDate, formattedTime }: InfoCardProps) {
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
                <i className="fa-solid fa-bullhorn text-primary"></i>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Informasi Login
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
                <p className="font-medium mb-2">Cara Login:</p>
                <p className="mb-3">
                  Untuk masuk ke sistem, gunakan kredensial berikut:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-2">
                  <li>
                    <strong>Username:</strong> Masukkan NIM Anda
                  </li>
                  <li>
                    <strong>Password:</strong> Masukkan tanggal lahir dengan
                    format <strong>YYYY-MM-DD</strong>
                    <br />
                    <span className="text-muted-foreground italic">
                      Contoh: 1990-02-28
                    </span>
                  </li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
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
