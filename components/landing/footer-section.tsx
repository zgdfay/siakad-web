import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export function FooterSection() {
  return (
    <footer className="border-t bg-muted/30 py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo/itb-yadika.png"
                alt="ITB YADIKA"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h4 className="font-bold text-sm">ITB YADIKA</h4>
                <p className="text-xs text-muted-foreground">Pasuruan</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Sistem Informasi Akademik 4.0 untuk kemudahan administrasi
              akademik.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <div className="space-y-2 text-sm">
              <a
                href="tel:+623434567890"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <i className="fa-solid fa-phone w-4"></i>
                <span>(0343) 746000</span>
              </a>
              <a
                href="mailto:info@itbyadika.ac.id"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <i className="fa-solid fa-envelope w-4"></i>
                <span>info@itbyadika.ac.id</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Tautan Cepat</h4>
            <div className="space-y-2 text-sm">
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="block text-muted-foreground hover:text-foreground transition-colors">
                <i className="fa-solid fa-right-to-bracket mr-2"></i>
                Masuk
              </Link>
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="block text-muted-foreground hover:text-foreground transition-colors">
                <i className="fa-solid fa-user-plus mr-2"></i>
                Daftar
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} ITB YADIKA Pasuruan. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

