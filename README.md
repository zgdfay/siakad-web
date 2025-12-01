# Sistem Informasi Akademik (Siakad) ITB YADIKA

Sistem manajemen akademik berbasis web untuk mengelola pendaftaran mata kuliah semester antara, jadwal kuliah, dan administrasi akademik.

## 🚀 Fitur Utama

### Untuk Mahasiswa

- **Dashboard**: Ringkasan pendaftaran dan status akademik
- **Pendaftaran Mata Kuliah**: Daftar mata kuliah semester antara dengan detail lengkap
- **Riwayat Pendaftaran**: Lihat semua pendaftaran yang pernah dilakukan
- **Jadwal Kuliah**: Lihat jadwal kuliah yang sudah didaftarkan
- **Unduhan**: Download SPK (Surat Perintah Kuliah) dan Invoice
- **Pengaturan**: Kelola profil dan password

### Untuk Admin

- **Manajemen User**: Tambah, edit, dan kelola user (Mahasiswa, Dosen, Admin)
- **Manajemen Semester Antara**: Kelola semester antara, periode, dan status
- **Manajemen Mata Kuliah**: Kelola mata kuliah dan penugasan ke semester
- **Manajemen Pendaftaran**: Verifikasi pendaftaran, kirim email notifikasi
- **Manajemen Jadwal**: Kelola jadwal kuliah
- **Pengaturan**: Konfigurasi sistem

## 🛠️ Teknologi

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Shadcn UI
- **Authentication**: Cookie-based session
- **Email**: Nodemailer
- **Language**: TypeScript

## 📋 Prasyarat

- Node.js 18+
- npm atau yarn
- PostgreSQL database (atau Supabase)
- Akun email untuk pengiriman email (Gmail/SMTP)

## 🔧 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd layanan-siakad
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root project dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:password@host:port/database"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Production: https://yourdomain.com

# Email Configuration (pilih salah satu)

# Opsi 1: Gmail
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@itbyadika.ac.id"

# Opsi 2: SMTP Custom
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"  # true untuk port 465
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
EMAIL_FROM="noreply@itbyadika.ac.id"

# Session Secret (untuk production, generate random string)
SESSION_SECRET="your-random-secret-key"
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrations
npx prisma migrate dev

# (Opsional) Seed database dengan data awal
npm run db:seed
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## 🏗️ Build untuk Production

### 1. Build Aplikasi

```bash
npm run build
```

### 2. Jalankan Production Server

```bash
npm start
```

## 📁 Struktur Project

```
layanan-siakad/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Halaman admin (protected)
│   ├── (auth)/            # Halaman autentikasi
│   ├── mahasiswa/         # Halaman mahasiswa (protected)
│   ├── api/               # API Routes
│   └── layout.tsx         # Root layout
├── components/            # React Components
│   ├── admin/            # Komponen admin
│   ├── auth/             # Komponen autentikasi
│   ├── layout/           # Komponen layout
│   └── ui/               # UI Components (Shadcn)
├── lib/                   # Utilities & Helpers
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Auth utilities
│   ├── session.ts        # Session management
│   ├── email.ts          # Email service
│   └── email-templates.ts # Email templates
├── prisma/                # Prisma schema & migrations
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/                # Static files
└── proxy.ts              # Middleware untuk routing & auth
```

## 🔐 Autentikasi & Authorization

### Role-based Access Control

- **ADMIN**: Akses penuh ke semua fitur admin
- **MAHASISWA**: Akses ke fitur mahasiswa (pendaftaran, jadwal, dll)
- **DOSEN**: Akses ke fitur dosen (akan dikembangkan)

### Session Management

- Session disimpan dalam HTTP-only cookie
- Session berlaku selama 7 hari
- Secure cookie di production (HTTPS required)

## 📧 Email Service

Sistem menggunakan Nodemailer untuk mengirim email. Dukungan untuk:

- Gmail (dengan App Password)
- SMTP custom
- Development mode (log email tanpa mengirim)

### Email yang Dikirim

1. **Pendaftaran Diterima**: Email otomatis saat admin memverifikasi pendaftaran sebagai "DITERIMA"

   - Berisi link download SPK dan Invoice
   - Dapat dikirim ulang secara manual oleh admin

2. **Lupa Password**: Email reset password dengan token

## 🗄️ Database Schema

### Tabel Utama

- **UserMaster**: Data user (NIM/NIP, nama, role, status)
- **Account**: Akun login (email, password hash)
- **Semester**: Data semester antara
- **MataKuliah**: Data mata kuliah
- **SemesterMataKuliah**: Penugasan mata kuliah ke semester
- **Pendaftaran**: Pendaftaran mahasiswa
- **PendaftaranDetail**: Detail mata kuliah yang didaftarkan
- **Payment**: Data pembayaran

## 🚢 Deployment

### Vercel (Recommended)

1. Push code ke GitHub/GitLab
2. Import project di Vercel
3. Set environment variables
4. Deploy

### Manual Deployment

1. Build aplikasi: `npm run build`
2. Set environment variables di server
3. Jalankan: `npm start`
4. Setup reverse proxy (Nginx/Apache) untuk HTTPS

### Environment Variables untuk Production

Pastikan semua environment variables sudah diset dengan benar:

- `DATABASE_URL`: Connection string ke database production
- `DIRECT_URL`: Direct connection untuk migrations
- `NEXT_PUBLIC_APP_URL`: URL aplikasi production
- `EMAIL_*` atau `SMTP_*`: Konfigurasi email production
- `NODE_ENV=production`

## 🔍 Troubleshooting

### Database Connection Error

- Pastikan `DATABASE_URL` dan `DIRECT_URL` sudah benar
- Untuk Supabase, gunakan connection pooling URL untuk `DATABASE_URL`
- Pastikan database sudah running dan accessible

### Email Tidak Terkirim

- Cek konfigurasi email di `.env`
- Untuk Gmail, pastikan menggunakan App Password (bukan password biasa)
- Cek log error di console
- Di development, email akan di-log ke console tanpa dikirim

### Build Error

- Pastikan semua dependencies terinstall: `npm install`
- Pastikan Prisma client sudah di-generate: `npx prisma generate`
- Cek TypeScript errors: `npm run lint`

## 📝 Development Guidelines

### Code Style

- Gunakan TypeScript untuk type safety
- Ikuti konvensi Next.js App Router
- Gunakan Shadcn UI components untuk konsistensi UI
- Error handling dengan try-catch di semua API routes

### Best Practices

1. **Security**:

   - Selalu validasi input di API routes
   - Gunakan Prisma untuk query (aman dari SQL injection)
   - Jangan expose sensitive data di response
   - Gunakan HTTPS di production

2. **Performance**:

   - Gunakan Prisma connection pooling
   - Implementasi pagination untuk data besar
   - Optimasi images dengan Next.js Image component

3. **Error Handling**:
   - Selalu handle error dengan try-catch
   - Return appropriate HTTP status codes
   - Log error untuk debugging (tanpa expose sensitive info)

## 🐛 Known Issues

- Beberapa TODO masih ada di codebase (akan diselesaikan)
- Console.log masih ada di beberapa file (akan dihapus untuk production)

## 📄 License

[Your License Here]

## 👥 Kontributor

[Your Team/Contributors]

## 📞 Support

Untuk pertanyaan atau masalah, hubungi tim development.
