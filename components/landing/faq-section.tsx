'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const faqs = [
  {
    question: 'Bagaimana cara mendaftar semester antara?',
    answer:
      'Anda dapat mendaftar dengan login ke portal akademik, pilih semester antara yang aktif, pilih mata kuliah yang ingin diambil, lengkapi data pendaftaran, dan upload bukti pembayaran. Setelah admin memverifikasi, status pendaftaran akan berubah menjadi diterima.',
  },
  {
    question: 'Metode pembayaran apa saja yang diterima?',
    answer:
      'Sistem menerima pembayaran melalui transfer bank. Setelah melakukan transfer, Anda perlu upload bukti pembayaran melalui portal. Admin akan memverifikasi pembayaran Anda dalam 1-3 hari kerja.',
  },
  {
    question: 'Kapan saya bisa download SPK?',
    answer:
      'SPK (Surat Perintah Kuliah) dapat diunduh setelah pembayaran Anda diverifikasi oleh admin dan status pendaftaran berubah menjadi "Diterima". SPK akan tersedia di dashboard dan halaman unduhan.',
  },
  {
    question: 'Bagaimana cara melihat jadwal kuliah?',
    answer:
      'Setelah pendaftaran diterima, Anda dapat melihat jadwal kuliah di menu "Jadwal Kuliah" pada dashboard. Jadwal akan menampilkan semua mata kuliah yang telah Anda daftarkan beserta waktu, kelas, dan dosen pengajar.',
  },
  {
    question: 'Apa yang harus saya lakukan jika lupa password?',
    answer:
      'Anda dapat menggunakan fitur "Lupa Password" di halaman login. Masukkan email atau NIM/NIP Anda, dan sistem akan mengirimkan link reset password ke email terdaftar. Pastikan email Anda aktif dan dapat diakses.',
  },
  {
    question: 'Bagaimana cara mengubah data pribadi?',
    answer:
      'Anda dapat mengubah data pribadi seperti nama dan email di menu "Pengaturan" pada dashboard. Untuk perubahan data penting lainnya, silakan hubungi admin melalui email atau datang langsung ke bagian administrasi.',
  },
  {
    question: 'Apakah sistem tersedia 24/7?',
    answer:
      'Ya, sistem dapat diakses 24 jam sehari, 7 hari seminggu. Namun, proses verifikasi pendaftaran dan pembayaran dilakukan pada jam kerja oleh admin. Notifikasi akan dikirimkan ke email Anda setelah proses verifikasi selesai.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-6 px-3 py-1 text-xs font-medium">
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Semua pertanyaan tentang pendaftaran, pembayaran, dan penggunaan
              sistem dijawab di sini.
            </p>
          </div>

          {/* 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Introduction */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground">
                Informasi FAQ
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Temukan jawaban untuk pertanyaan umum tentang sistem administrasi
                akademik. Jika pertanyaan Anda tidak terjawab, silakan hubungi
                admin melalui email atau datang langsung ke bagian administrasi.
              </p>
            </div>

            {/* Right: FAQ List */}
            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <Collapsible
                  key={index}
                  open={openIndex === index}
                  onOpenChange={(isOpen) =>
                    setOpenIndex(isOpen ? index : null)
                  }>
                  <div className="border-b last:border-b-0">
                    <CollapsibleTrigger className="w-full py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors group">
                      <span className="font-medium text-foreground pr-4">
                        {faq.question}
                      </span>
                      <i
                        className={`fa-solid fa-chevron-down text-muted-foreground transition-transform shrink-0 ${
                          openIndex === index ? 'rotate-180' : ''
                        }`}></i>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-4 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                      <p className="text-sm text-muted-foreground leading-relaxed pr-8 pt-2">
                        {faq.answer}
                      </p>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

