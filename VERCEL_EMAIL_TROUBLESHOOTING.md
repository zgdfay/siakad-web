# Troubleshooting Email di Vercel

## Masalah Umum

### 1. Email Gagal Terkirim

**Kemungkinan Penyebab:**
- Environment variables tidak ter-set di Vercel
- Gmail memblokir akses (Less Secure Apps)
- Timeout issues
- SMTP server tidak bisa diakses dari Vercel

## Solusi

### ✅ Opsi 1: Gunakan Gmail dengan App Password (Recommended untuk Testing)

1. **Buat App Password di Gmail:**
   - Buka https://myaccount.google.com/apppasswords
   - Pilih "Mail" dan "Other (Custom name)"
   - Masukkan nama: "Siakad Vercel"
   - Copy password yang di-generate

2. **Set Environment Variables di Vercel:**
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (App Password dari Gmail)
   EMAIL_FROM=noreply@itbyadika.ac.id
   ```

3. **Enable 2-Step Verification** (wajib untuk App Password)

### ✅ Opsi 2: Gunakan SMTP Custom (Recommended untuk Production)

**Contoh dengan Gmail SMTP:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@itbyadika.ac.id
```

**Contoh dengan SMTP lain (SendGrid, Mailgun, dll):**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@itbyadika.ac.id
```

### ✅ Opsi 3: Gunakan Resend (Paling Mudah untuk Vercel)

Resend adalah email service yang sangat cocok untuk Vercel dan Next.js.

1. **Daftar di Resend:**
   - Buka https://resend.com
   - Daftar akun gratis (100 emails/hari)
   - Dapatkan API key

2. **Install Resend:**
   ```bash
   npm install resend
   ```

3. **Update `lib/email.ts` untuk support Resend** (opsional, bisa ditambahkan)

## Checklist Environment Variables di Vercel

Pastikan semua environment variables sudah diset di Vercel Dashboard:

1. Login ke Vercel Dashboard
2. Pilih project Anda
3. Settings → Environment Variables
4. Tambahkan semua variables:
   - `EMAIL_SERVICE` atau `SMTP_HOST`
   - `EMAIL_USER` atau `SMTP_USER`
   - `EMAIL_PASSWORD` atau `SMTP_PASSWORD`
   - `EMAIL_FROM`
   - `SMTP_PORT` (jika menggunakan SMTP)
   - `SMTP_SECURE` (jika menggunakan SMTP)

**PENTING:** Pastikan environment variables diset untuk **Production**, **Preview**, dan **Development**.

## Debugging

### Cek Logs di Vercel

1. Buka Vercel Dashboard → Project → Logs
2. Cari error terkait email
3. Error yang mungkin muncul:
   - `EAUTH`: Autentikasi gagal
   - `ECONNECTION`: Koneksi gagal
   - `ETIMEDOUT`: Timeout

### Test Email Configuration

Tambahkan endpoint test (hanya untuk development):

```typescript
// app/api/test-email/route.ts
import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email</p>',
    });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

## Tips

1. **Gmail App Password:**
   - Jangan gunakan password Gmail biasa
   - Harus menggunakan App Password
   - Enable 2-Step Verification dulu

2. **SMTP Port:**
   - Port 587: STARTTLS (SMTP_SECURE=false)
   - Port 465: SSL/TLS (SMTP_SECURE=true)

3. **Timeout:**
   - Vercel memiliki timeout 10 detik untuk Hobby plan
   - Pastikan SMTP server merespons cepat
   - Gunakan email service yang reliable (SendGrid, Mailgun, Resend)

4. **Firewall:**
   - Beberapa SMTP server memblokir IP Vercel
   - Gunakan email service yang mendukung cloud platforms

## Rekomendasi untuk Production

Untuk production, gunakan email service profesional:

1. **Resend** (Recommended) - https://resend.com
   - Free tier: 100 emails/hari
   - Mudah setup
   - Built for Next.js

2. **SendGrid** - https://sendgrid.com
   - Free tier: 100 emails/hari
   - Reliable dan scalable

3. **Mailgun** - https://mailgun.com
   - Free tier: 5,000 emails/bulan
   - Good for high volume

4. **AWS SES** - https://aws.amazon.com/ses/
   - Pay as you go
   - Very scalable
   - But requires AWS setup

