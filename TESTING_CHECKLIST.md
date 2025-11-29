# 📋 Checklist Testing - Layanan Siakad

## 🔐 Flow Authentication Saat Ini

### ✅ Yang Sudah Benar:
1. **Setiap user membawa data sendiri** - Setelah login, user data (id, nim, name, email, role, status) disimpan di localStorage
2. **Data berbeda per user** - Setiap user yang login akan mendapatkan data mereka sendiri dari database
3. **Role-based redirect** - User di-redirect ke halaman sesuai role mereka (ADMIN → /admin, MAHASISWA → /mahasiswa)
4. **Password hashing** - Password di-hash menggunakan bcrypt sebelum disimpan
5. **Validasi NIM** - NIM divalidasi real-time saat register

### ⚠️ Yang Perlu Diperbaiki:
1. **Session Management** - Saat ini masih menggunakan localStorage (tidak aman untuk production)
2. **Layout masih hardcoded** - Layout mahasiswa/admin masih menggunakan mock data, belum mengambil dari localStorage
3. **Tidak ada middleware protection** - Halaman protected belum dicek apakah user sudah login
4. **Tidak ada token expiration** - Session tidak pernah expire

---

## 🧪 Testing Checklist

### 1. ✅ Authentication Flow

#### 1.1 Login
- [ ] Login dengan NIM yang valid dan password benar → **Berhasil**
  - Test: `22121001` / `password123`
  - Expected: Redirect ke `/mahasiswa`, user data tersimpan di localStorage
- [ ] Login dengan NIM yang tidak terdaftar → **Error**
  - Test: `99999999` / `password123`
  - Expected: Error "NIM atau password salah"
- [ ] Login dengan password salah → **Error**
  - Test: `22121001` / `wrongpassword`
  - Expected: Error "NIM atau password salah"
- [ ] Login dengan NIM yang belum punya account → **Error**
  - Test: `22121004` / `password123`
  - Expected: Error "Akun belum terdaftar. Silakan daftar terlebih dahulu."
- [ ] Login dengan NIM yang status NONAKTIF → **Error**
  - Test: `22121011` (setelah register)
  - Expected: Error "Akun Anda tidak aktif. Hubungi admin untuk mengaktifkan akun."
- [ ] Login sebagai Admin → **Berhasil**
  - Test: `ADMIN001` / `password123`
  - Expected: Redirect ke `/admin`
- [ ] Login sebagai Dosen → **Berhasil**
  - Test: `DSN001` / `password123`
  - Expected: Redirect ke `/dosen` (atau error jika halaman belum ada)

#### 1.2 Register
- [ ] Register dengan NIM yang valid dan belum punya account → **Berhasil**
  - Test: `22121004` dengan email dan password baru
  - Expected: Account dibuat, redirect ke login atau auto-login
- [ ] Register dengan NIM yang tidak terdaftar → **Error**
  - Test: `99999999`
  - Expected: Error "NIM tidak terdaftar di sistem"
- [ ] Register dengan NIM yang sudah punya account → **Error**
  - Test: `22121001`
  - Expected: Error "NIM terdaftar, namun akun sudah dibuat"
- [ ] Register dengan NIM yang status NONAKTIF → **Error**
  - Test: `22121011`
  - Expected: Error "NIM terdaftar, namun akun tidak aktif"
- [ ] Register dengan NIM yang role bukan MAHASISWA → **Error**
  - Test: `22121012` (role DOSEN)
  - Expected: Error "Hanya mahasiswa yang dapat mendaftar"
- [ ] Register dengan email yang sudah digunakan → **Error**
  - Test: Email yang sudah dipakai user lain
  - Expected: Error "Email sudah digunakan"
- [ ] Register dengan password kurang dari 6 karakter → **Error**
  - Test: Password `12345`
  - Expected: Error "Password minimal 6 karakter"
- [ ] Register dengan email format tidak valid → **Error**
  - Test: Email `invalid-email`
  - Expected: Error "Format email tidak valid"

#### 1.3 Logout
- [ ] Logout dari halaman mahasiswa → **Berhasil**
  - Expected: localStorage cleared, redirect ke `/auth/login`
- [ ] Logout dari halaman admin → **Berhasil**
  - Expected: localStorage cleared, redirect ke `/auth/login`
- [ ] Logout dengan confirm dialog → **Berhasil**
  - Expected: Dialog muncul, setelah confirm logout

---

### 2. ✅ User Data & Session

#### 2.1 User Data di localStorage
- [ ] Setelah login, cek localStorage → **Berhasil**
  - Expected: Key `user` berisi JSON dengan: id, nim, name, email, role, status
- [ ] User data berbeda untuk setiap user → **Berhasil**
  - Test: Login sebagai `22121001`, lalu logout, login sebagai `22121002`
  - Expected: Data di localStorage berbeda sesuai user yang login
- [ ] User data persist setelah refresh → **Berhasil**
  - Test: Login, refresh page
  - Expected: User masih login (jika layout sudah di-update)

#### 2.2 Role-based Access
- [ ] Mahasiswa tidak bisa akses `/admin` → **Error/Redirect**
  - Test: Login sebagai mahasiswa, akses `/admin`
  - Expected: Redirect ke `/mahasiswa` atau error
- [ ] Admin tidak bisa akses `/mahasiswa` → **Error/Redirect**
  - Test: Login sebagai admin, akses `/mahasiswa`
  - Expected: Redirect ke `/admin` atau error

---

### 3. ✅ Forgot Password & Reset Password

#### 3.1 Forgot Password
- [ ] Request reset dengan email yang valid → **Berhasil**
  - Test: Email `budi.santoso@student.itbyadika.ac.id`
  - Expected: Token dibuat, log di console (simulasi email)
- [ ] Request reset dengan email yang tidak terdaftar → **Error**
  - Test: Email `notfound@example.com`
  - Expected: Error "Email tidak terdaftar"
- [ ] Request reset dengan email format tidak valid → **Error**
  - Test: Email `invalid-email`
  - Expected: Error "Format email tidak valid"

#### 3.2 Reset Password
- [ ] Reset dengan token yang valid → **Berhasil**
  - Test: Token dari forgot password
  - Expected: Password berubah, bisa login dengan password baru
- [ ] Reset dengan token yang expired → **Error**
  - Test: Token yang sudah expired (lebih dari 1 jam)
  - Expected: Error "Token tidak valid atau sudah kadaluarsa"
- [ ] Reset dengan token yang tidak valid → **Error**
  - Test: Token random
  - Expected: Error "Token tidak valid atau sudah kadaluarsa"
- [ ] Reset dengan password kurang dari 6 karakter → **Error**
  - Test: Password `12345`
  - Expected: Error "Password minimal 6 karakter"
- [ ] Reset dengan password dan confirm password tidak sama → **Error**
  - Test: Password `newpass123`, Confirm `different123`
  - Expected: Error "Password tidak sama"

---

### 4. ✅ Mahasiswa Pages

#### 4.1 Dashboard (`/mahasiswa`)
- [ ] Tampilkan statistik pendaftaran → **Berhasil**
- [ ] Tampilkan pendaftaran aktif → **Berhasil**
- [ ] Empty state jika tidak ada pendaftaran aktif → **Berhasil**
- [ ] Detail modal pendaftaran aktif → **Berhasil**
- [ ] Quick actions (Pendaftaran, Riwayat) → **Berhasil**

#### 4.2 Pendaftaran (`/mahasiswa/pendaftaran`)
- [ ] Tampilkan semua semester dan mata kuliah → **Berhasil**
- [ ] Search/filter mata kuliah → **Berhasil**
- [ ] Pilih mata kuliah → **Berhasil**
- [ ] Summary sidebar (total SKS, total biaya) → **Berhasil**
- [ ] Checkout dengan mata kuliah terpilih → **Berhasil**

#### 4.3 Riwayat (`/mahasiswa/riwayat`)
- [ ] Tampilkan semua riwayat pendaftaran → **Berhasil**
- [ ] Filter berdasarkan status → **Berhasil**
- [ ] Detail modal riwayat → **Berhasil**
- [ ] Empty state jika tidak ada riwayat → **Berhasil**

#### 4.4 Pengaturan (`/mahasiswa/pengaturan`)
- [ ] Tampilkan data user (NIM disabled) → **Berhasil**
- [ ] Update nama → **Berhasil**
- [ ] Update email → **Berhasil**
- [ ] Update password → **Berhasil**
- [ ] Validasi form (required fields) → **Berhasil**
- [ ] Confirm dialog untuk perubahan → **Berhasil**

---

### 5. ✅ Admin Pages

#### 5.1 Dashboard (`/admin`)
- [ ] Tampilkan statistik → **Berhasil**
- [ ] Quick actions (Kelola Pendaftaran, Semester Antara, User, Mata Kuliah) → **Berhasil**
- [ ] Warna berbeda untuk setiap quick action → **Berhasil**

#### 5.2 Manajemen User (`/admin/manajemen-user`)
- [ ] Tampilkan semua user → **Berhasil**
- [ ] Search user → **Berhasil**
- [ ] Filter berdasarkan role → **Berhasil**
- [ ] Tambah user (modal) → **Berhasil**
- [ ] Edit user (modal) → **Berhasil**
- [ ] Hapus user (alert dialog) → **Berhasil**
- [ ] Import CSV → **Berhasil**
  - Test: Import file dengan format: NIM, Name, Role
  - Expected: User dibuat sesuai data CSV
- [ ] Badge status (Aktif/Nonaktif) → **Berhasil**
- [ ] Disable save button jika form kosong → **Berhasil**

#### 5.3 Manajemen Pendaftaran (`/admin/pendaftaran`)
- [ ] Tampilkan semua pendaftaran → **Berhasil**
- [ ] Filter berdasarkan status → **Berhasil**
- [ ] Verifikasi pendaftaran → **Berhasil**
- [ ] Tolak pendaftaran → **Berhasil**

#### 5.4 Manajemen Semester Antara (`/admin/semester-antara`)
- [ ] Tampilkan semua semester → **Berhasil**
- [ ] Aktifkan/nonaktifkan semester (Ganjil/Genap) → **Berhasil**
- [ ] Tambah semester → **Berhasil**
- [ ] Edit semester → **Berhasil**
- [ ] Hapus semester → **Berhasil**
- [ ] Kelola mata kuliah per semester → **Berhasil**

#### 5.5 Manajemen Mata Kuliah (`/admin/manajemen-mata-kuliah`)
- [ ] Tampilkan semua mata kuliah → **Berhasil**
- [ ] Tambah mata kuliah → **Berhasil**
- [ ] Edit mata kuliah → **Berhasil**
- [ ] Hapus mata kuliah → **Berhasil**
- [ ] Assign mata kuliah ke semester → **Berhasil**

---

### 6. ✅ API Endpoints

#### 6.1 `/api/auth/login`
- [ ] POST dengan data valid → **200 OK**
- [ ] POST dengan NIM tidak terdaftar → **401 Unauthorized**
- [ ] POST dengan password salah → **401 Unauthorized**
- [ ] POST dengan data tidak lengkap → **400 Bad Request**
- [ ] POST dengan JSON invalid → **400 Bad Request**

#### 6.2 `/api/auth/register`
- [ ] POST dengan data valid → **201 Created**
- [ ] POST dengan NIM tidak terdaftar → **404 Not Found**
- [ ] POST dengan NIM sudah punya account → **409 Conflict**
- [ ] POST dengan email sudah digunakan → **409 Conflict**
- [ ] POST dengan data tidak lengkap → **400 Bad Request**

#### 6.3 `/api/auth/check-nim`
- [ ] GET dengan NIM valid dan belum punya account → **200 OK**
- [ ] GET dengan NIM valid tapi sudah punya account → **200 OK** (hasAccount: true)
- [ ] GET dengan NIM tidak terdaftar → **200 OK** (exists: false)
- [ ] GET dengan NIM kurang dari 3 karakter → **400 Bad Request**

#### 6.4 `/api/auth/forgot-password`
- [ ] POST dengan email valid → **200 OK**
- [ ] POST dengan email tidak terdaftar → **404 Not Found**
- [ ] POST dengan email format tidak valid → **400 Bad Request**

#### 6.5 `/api/auth/reset-password`
- [ ] POST dengan token valid → **200 OK**
- [ ] POST dengan token expired → **400 Bad Request**
- [ ] POST dengan token tidak valid → **400 Bad Request**
- [ ] POST dengan password kurang dari 6 karakter → **400 Bad Request**

---

### 7. ✅ UI/UX

#### 7.1 Sidebar
- [ ] Tampilkan user name dan email (truncate jika panjang) → **Berhasil**
- [ ] Navigasi aktif sesuai halaman → **Berhasil**
- [ ] Logout dengan confirm dialog (button merah) → **Berhasil**

#### 7.2 Forms
- [ ] Validasi real-time → **Berhasil**
- [ ] Error messages jelas → **Berhasil**
- [ ] Loading states → **Berhasil**
- [ ] Success toast notifications → **Berhasil**

#### 7.3 Responsive
- [ ] Mobile view → **Berhasil**
- [ ] Tablet view → **Berhasil**
- [ ] Desktop view → **Berhasil**

---

### 8. ✅ Security

#### 8.1 Password Security
- [ ] Password di-hash dengan bcrypt → **Berhasil**
- [ ] Password tidak dikirim dalam response → **Berhasil**
- [ ] Password tidak terlihat di localStorage → **Berhasil**

#### 8.2 Input Validation
- [ ] SQL injection prevention → **Berhasil** (Prisma handles this)
- [ ] XSS prevention → **Berhasil** (React escapes by default)
- [ ] CSRF protection → **TODO** (belum diimplementasikan)

---

## 🚀 Next Steps (Setelah Testing Selesai)

1. **Implementasi Session Management yang Proper**
   - Gunakan NextAuth.js atau JWT dengan httpOnly cookies
   - Implementasi token expiration
   - Implementasi refresh token

2. **Middleware Protection**
   - Buat middleware untuk protect routes
   - Redirect ke login jika tidak authenticated
   - Redirect berdasarkan role

3. **Update Layout untuk Menggunakan User Data**
   - Update `app/mahasiswa/layout.tsx` untuk ambil user dari localStorage
   - Update `app/admin/layout.tsx` untuk ambil user dari localStorage
   - Handle case jika user tidak ada (redirect ke login)

4. **Error Handling yang Lebih Baik**
   - Global error boundary
   - Better error messages
   - Error logging

5. **Testing Automation**
   - Unit tests untuk utilities
   - Integration tests untuk API
   - E2E tests untuk critical flows

---

## 📝 Notes

- **Current State**: Authentication flow sudah benar, setiap user membawa data sendiri
- **Storage**: Saat ini menggunakan localStorage (temporary, perlu diganti dengan session management yang proper)
- **Security**: Password sudah di-hash, tapi session management perlu diperbaiki untuk production

