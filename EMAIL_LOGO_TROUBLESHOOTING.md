# 🔧 Troubleshooting Logo di Email

## Masalah: Logo tidak muncul di email

### Kemungkinan Penyebab:

1. **NEXT_PUBLIC_APP_URL tidak di-set atau salah**
   - Logo menggunakan URL: `${NEXT_PUBLIC_APP_URL}/logo/itb-yadika.png`
   - Pastikan `NEXT_PUBLIC_APP_URL` di-set di `.env` atau `.env.local`

2. **Email client memblokir external images**
   - Banyak email client (Gmail, Outlook, dll) memblokir images dari external URL secara default
   - User perlu "Allow images" atau "Display images" di email client mereka

3. **URL tidak accessible dari internet**
   - Jika menggunakan `localhost:3000`, email client tidak bisa akses
   - Gunakan domain yang accessible dari internet (production URL)

## Solusi:

### 1. Set NEXT_PUBLIC_APP_URL

Tambahkan ke `.env` atau `.env.local`:

```env
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production (ganti dengan domain Anda)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Test URL Logo

Test apakah URL logo accessible:
- Buka browser
- Akses: `http://localhost:3000/logo/itb-yadika.png` (development)
- Atau: `https://yourdomain.com/logo/itb-yadika.png` (production)
- Pastikan logo muncul

### 3. Alternatif: Hosted Image

Jika logo masih tidak muncul, gunakan hosted image service:

```typescript
// Di lib/email-templates.ts
const logoUrl = 'https://your-cdn.com/logo/itb-yadika.png';
// Atau
const logoUrl = 'https://yourdomain.com/logo/itb-yadika.png';
```

### 4. Base64 Encoding (untuk small images)

Jika logo kecil (< 50KB), bisa gunakan base64:

```typescript
const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANS...';
```

**Note:** File logo saat ini 374KB, terlalu besar untuk base64 (akan membuat email sangat besar).

### 5. Fallback Text

Template sudah menggunakan fallback, tapi jika logo tidak muncul:
- Pastikan alt text ada: `alt="ITB YADIKA"`
- Email client akan menampilkan alt text jika image tidak load

## Testing:

1. **Test di development:**
   ```bash
   # Set NEXT_PUBLIC_APP_URL di .env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Test URL logo
   curl http://localhost:3000/logo/itb-yadika.png
   ```

2. **Test email:**
   - Request reset password
   - Check email inbox
   - Klik "Display images" jika diminta
   - Logo seharusnya muncul

3. **Check console log:**
   - Di development, check console untuk URL logo yang digunakan
   - Pastikan URL benar

## Best Practices untuk Email Images:

1. ✅ Gunakan absolute URL (dengan domain lengkap)
2. ✅ Tambahkan width dan height attributes
3. ✅ Gunakan alt text
4. ✅ Host images di CDN atau domain yang reliable
5. ✅ Test di berbagai email client (Gmail, Outlook, Apple Mail)

## Current Implementation:

- ✅ Absolute URL dengan `NEXT_PUBLIC_APP_URL`
- ✅ Width dan height attributes
- ✅ Alt text
- ✅ Table-based layout untuk email client compatibility
- ⚠️ Perlu pastikan `NEXT_PUBLIC_APP_URL` di-set dengan benar

