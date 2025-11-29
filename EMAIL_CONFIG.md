# 📧 Konfigurasi Email

Dokumentasi untuk mengkonfigurasi email service untuk fitur reset password.

## Environment Variables

Tambahkan variabel berikut ke file `.env` atau `.env.local`:

### Opsi 1: Gmail (Recommended untuk Development)

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@itbyadika.ac.id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Cara mendapatkan App Password Gmail:**

1. Buka [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (harus aktif)
3. App passwords → Generate new app password
4. Copy password yang dihasilkan

### Opsi 2: SMTP Custom

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@itbyadika.ac.id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Opsi 3: Development (Mock - Tidak Kirim Email)

Jika tidak ada konfigurasi email, sistem akan:

- Log email ke console (development)
- Tetap return success (untuk keamanan)

## Production Recommendations

Untuk production, gunakan service email profesional:

### 1. Resend (Recommended)

- Sign up di [resend.com](https://resend.com)
- Free tier: 3,000 emails/month
- API key based authentication

### 2. SendGrid

- Sign up di [sendgrid.com](https://sendgrid.com)
- Free tier: 100 emails/day
- SMTP atau API

### 3. AWS SES

- Amazon Simple Email Service
- Pay as you go
- High deliverability

## Testing

1. Set environment variables
2. Request reset password
3. Check email inbox (atau console log di development)
4. Click link di email
5. Reset password

## Troubleshooting

### Email tidak terkirim

- Check environment variables
- Check SMTP credentials
- Check spam folder
- Check console logs untuk error

### Gmail Error

- Pastikan 2-Step Verification aktif
- Gunakan App Password, bukan password biasa
- Check "Less secure app access" (jika masih tersedia)
