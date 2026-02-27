# System Flow - Sistem Informasi Akademik (Siakad) ITB YADIKA

## 📋 Daftar Isi

1. [Overview Sistem](#overview-sistem)
2. [Database Schema Flow](#database-schema-flow)
3. [Authentication & Authorization Flow](#authentication--authorization-flow)
4. [User Registration Flow](#user-registration-flow)
5. [Course Registration Flow](#course-registration-flow)
6. [Payment Flow](#payment-flow)
7. [Admin Verification Flow](#admin-verification-flow)
8. [Email Notification Flow](#email-notification-flow)
9. [Session Management Flow](#session-management-flow)

---

## Overview Sistem

Sistem Informasi Akademik (Siakad) ITB YADIKA adalah aplikasi web berbasis Next.js untuk mengelola pendaftaran mata kuliah semester antara. Sistem ini memiliki 3 role utama:

- **ADMIN**: Mengelola user, semester, mata kuliah, dan memverifikasi pendaftaran
- **MAHASISWA**: Mendaftar mata kuliah, upload bukti pembayaran, melihat jadwal
- **DOSEN**: (Akan dikembangkan)

---

## Database Schema Flow

### Entity Relationship

```
UserMaster (1) ──< (1) Account
    │
    │ (1)
    │
    └──< (N) Pendaftaran
            │
            │ (1)
            │
            ├──< (1) Payment
            │
            └──< (N) PendaftaranDetail
                    │
                    │ (N)
                    │
                    └──> (1) SemesterMataKuliah
                            │
                            │ (1)
                            │
                            ├──> (1) Semester
                            │
                            └──> (1) MataKuliah
```

### Flow Data Model

1. **UserMaster** → Data master user (NIM/NIP, nama, role, status)
2. **Account** → Credential login (email, password hash, reset token)
3. **Semester** → Data semester antara (nama, periode, tanggal, deadline)
4. **MataKuliah** → Master data mata kuliah (kode, nama, SKS, prodi)
5. **SemesterMataKuliah** → Penugasan mata kuliah ke semester (kelas, jadwal, dosen, kuota, biaya)
6. **Pendaftaran** → Pendaftaran mahasiswa ke semester (total SKS, total biaya, status)
7. **PendaftaranDetail** → Detail mata kuliah yang didaftarkan
8. **Payment** → Data pembayaran (jumlah, status, bukti pembayaran)

---

## Authentication & Authorization Flow

### Flow Diagram

```
┌─────────────┐
│   Visitor   │
└──────┬──────┘
       │
       ├──> [Public Route] ──> Allow Access
       │
       ├──> [Protected Route]
       │         │
       │         ├──> Check Cookie Session
       │         │         │
       │         │         ├──> [No Session] ──> Redirect to Login
       │         │         │
       │         │         └──> [Has Session]
       │         │                   │
       │         │                   ├──> Parse User Data
       │         │                   │
       │         │                   ├──> Check Role
       │         │                   │
       │         │                   ├──> [Role Match] ──> Allow Access
       │         │                   │
       │         │                   └──> [Role Mismatch] ──> Redirect to /unauthorized
       │         │
       │         └──> [Admin Route]
       │                   │
       │                   └──> Check if Role = ADMIN
       │                             │
       │                             ├──> [Yes] ──> Allow Access
       │                             │
       │                             └──> [No] ──> Redirect to /unauthorized
```

### Middleware Flow (proxy.ts)

1. **Public Routes Check**
   - Routes: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/unauthorized`
   - Jika sudah login dan akses auth routes → redirect ke dashboard sesuai role
   - Jika belum login → allow access

2. **Protected Routes Check**
   - Cek cookie `siakad_session`
   - Jika tidak ada → redirect ke login dengan query `redirect`
   - Jika ada → parse user data
   - Validasi user object (id, role)
   - Check role-based access:
     - Admin routes → hanya ADMIN
     - Mahasiswa routes → hanya MAHASISWA
     - Dosen routes → hanya DOSEN

3. **Reset Password Token Validation**
   - Cek format token (64 karakter hex)
   - Jika tidak valid → redirect ke forgot-password dengan error

---

## User Registration Flow

### Self-Registration (Mahasiswa Only)

```
┌──────────────┐
│   Mahasiswa  │
└──────┬───────┘
       │
       ├──> Fill Registration Form
       │         │
       │         ├──> NIM
       │         ├──> Name
       │         ├──> Email
       │         └──> Password
       │
       ├──> Submit to /api/auth/register
       │         │
       │         ├──> Validate Input
       │         │         │
       │         │         ├──> [Invalid] ──> Return Error
       │         │         │
       │         │         └──> [Valid]
       │         │
       │         ├──> Check NIM in UserMaster
       │         │         │
       │         │         ├──> [Not Found] ──> Return Error: "NIM tidak terdaftar"
       │         │         │
       │         │         └──> [Found]
       │         │                   │
       │         │                   ├──> Check if Account Exists
       │         │                   │         │
       │         │                   │         ├──> [Exists] ──> Return Error: "Akun sudah terdaftar"
       │         │                   │         │
       │         │                   │         └──> [Not Exists]
       │         │                   │
       │         │                   ├──> Check User Status
       │         │                   │         │
       │         │                   │         ├──> [NONAKTIF] ──> Return Error: "Akun tidak aktif"
       │         │                   │         │
       │         │                   │         └──> [AKTIF]
       │         │                   │
       │         │                   ├──> Check Role
       │         │                   │         │
       │         │                   │         ├──> [Not MAHASISWA] ──> Return Error: "Hanya mahasiswa"
       │         │                   │         │
       │         │                   │         └──> [MAHASISWA]
       │         │                   │
       │         │                   └──> Check Email Uniqueness
       │         │                             │
       │         │                             ├──> [Exists] ──> Return Error: "Email sudah digunakan"
       │         │                             │
       │         │                             └──> [Unique]
       │         │
       │         ├──> Hash Password (bcrypt, saltRounds=10)
       │         │
       │         ├──> Update UserMaster.name (if empty)
       │         │
       │         ├──> Create Account
       │         │         │
       │         │         └──> userMasterId, email, passwordHash
       │         │
       │         ├──> Set Session Cookie (auto-login)
       │         │         │
       │         │         └──> siakad_session: {id, nim, name, email, role, status}
       │         │
       │         └──> Return Success + User Data
       │
       └──> Redirect to Dashboard (based on role)
```

### Admin Creates User

```
┌──────────┐
│  Admin   │
└────┬─────┘
     │
     ├──> Fill User Form
     │         │
     │         ├──> NIM/NIP
     │         ├──> Name (optional)
     │         ├──> Role (MAHASISWA/DOSEN/ADMIN)
     │         ├──> Status (AKTIF/NONAKTIF)
     │         └──> Email (optional)
     │
     ├──> Submit to /api/users (POST)
     │         │
     │         ├──> Check Authentication (Admin Only)
     │         │
     │         ├──> Validate Input
     │         │
     │         ├──> Check NIM/NIP Uniqueness
     │         │
     │         ├──> Check Email Uniqueness (if provided)
     │         │
     │         ├──> Create UserMaster
     │         │         │
     │         │         └──> If email provided → Create Account with dummy password hash
     │         │                   │
     │         │                   └──> User must reset password
     │         │
     │         └──> Return Success
     │
     └──> User Created (can self-register if MAHASISWA)
```

---

## Course Registration Flow

### Pendaftaran Mata Kuliah (Mahasiswa)

```
┌──────────────┐
│   Mahasiswa  │
└──────┬───────┘
       │
       ├──> Select Semester Antara
       │         │
       │         └──> Check Semester Status = AKTIF
       │                   │
       │                   └──> Check Deadline (not passed)
       │
       ├──> Browse Available Courses
       │         │
       │         └──> Filter by Semester
       │                   │
       │                   └──> Show: MataKuliah + SemesterMataKuliah
       │                             │
       │                             ├──> Kode, Nama, SKS
       │                             ├──> Kelas, Jadwal, Dosen
       │                             ├──> Kuota, Terisi
       │                             └──> Biaya
       │
       ├──> Select Courses
       │         │
       │         ├──> Check Quota (terisi < kuota)
       │         │
       │         └──> Add to Cart
       │
       ├──> Review Selection (Checkout)
       │         │
       │         ├──> Calculate Total SKS
       │         │
       │         └──> Calculate Total Biaya
       │
       ├──> Submit to /api/pendaftaran (POST)
       │         │
       │         ├──> Check Authentication (Mahasiswa Only)
       │         │
       │         ├──> Validate Input
       │         │         │
       │         │         ├──> semesterId required
       │         │         └──> mataKuliahIds array (not empty)
       │         │
       │         ├──> Check Semester Exists & Active
       │         │         │
       │         │         ├──> [Not Found] ──> Return Error
       │         │         │
       │         │         └──> [Found]
       │         │                   │
       │         │                   ├──> Check Status = AKTIF
       │         │                   │
       │         │                   └──> Check Deadline (not passed)
       │         │
       │         ├──> Validate All Mata Kuliah Exist in Semester
       │         │
       │         ├──> Check Quota for Each Course
       │         │         │
       │         │         ├──> [Quota Full] ──> Return Error
       │         │         │
       │         │         └──> [Available]
       │         │
       │         ├──> Check for Overlapping Courses
       │         │         │
       │         │         └──> Check if user already has DITERIMA pendaftaran
       │         │                   │
       │         │                   └──> [Overlap] ──> Return Error
       │         │
       │         ├──> Calculate Total SKS & Total Biaya
       │         │
       │         └──> Create in Transaction:
       │                   │
       │                   ├──> Create Pendaftaran
       │                   │         │
       │                   │         └──> status = MENUNGGU_VERIFIKASI
       │                   │
       │                   ├──> Create PendaftaranDetail (for each course)
       │                   │
       │                   ├──> Create Payment
       │                   │         │
       │                   │         └──> status = BELUM_BAYAR
       │                   │
       │                   └──> Update SemesterMataKuliah.terisi (+1)
       │
       └──> Redirect to Payment Page
```

### Status Flow Pendaftaran

```
MENUNGGU_VERIFIKASI
       │
       ├──> [Admin Verifies] ──> DITERIMA
       │         │                    │
       │         │                    ├──> Payment Status → LUNAS (auto)
       │         │                    │
       │         │                    └──> Send Email Notification
       │         │
       │         └──> [Admin Rejects] ──> DITOLAK
       │                   │
       │                   └──> Revert Quota (terisi -1)
       │
       └──> [User Cancels] ──> DIBATALKAN
                     │
                     └──> Revert Quota (terisi -1)
```

---

## Payment Flow

### Upload Bukti Pembayaran

```
┌──────────────┐
│   Mahasiswa  │
└──────┬───────┘
       │
       ├──> Go to Payment Page
       │         │
       │         └──> Show Pendaftaran Details
       │                   │
       │                   ├──> Total Biaya
       │                   └──> Payment Status
       │
       ├──> Fill Payment Form
       │         │
       │         ├──> Metode Pembayaran
       │         └──> Upload Bukti (File)
       │                   │
       │                   ├──> Format: JPG, PNG, PDF
       │                   └──> Max Size: 5MB
       │
       ├──> Submit to /api/payment/upload (POST)
       │         │
       │         ├──> Check Authentication (Mahasiswa Only)
       │         │
       │         ├──> Validate Input
       │         │         │
       │         │         ├──> pendaftaranId required
       │         │         ├──> metodePembayaran required
       │         │         └──> file required
       │         │
       │         ├──> Check Pendaftaran Exists & Belongs to User
       │         │
       │         ├──> Validate File Type & Size
       │         │
       │         ├──> Upload to Cloudinary
       │         │         │
       │         │         ├──> Folder: payment-proofs/{pendaftaranId}
       │         │         └──> Generate Unique Filename
       │         │
       │         ├──> Update/Create Payment Record
       │         │         │
       │         │         ├──> metodePembayaran
       │         │         ├──> buktiPembayaran (URL)
       │         │         └──> status = MENUNGGU_VERIFIKASI
       │         │
       │         └──> Return Success
       │
       └──> Payment Status Updated
```

### Payment Status Flow

```
BELUM_BAYAR
    │
    ├──> [Upload Bukti] ──> MENUNGGU_VERIFIKASI
    │         │
    │         └──> Admin verifies payment proof
    │                   │
    │                   ├──> [Verified] ──> LUNAS
    │                   │
    │                   └──> [Rejected] ──> DITOLAK
    │
    └──> [Admin Accepts Pendaftaran] ──> LUNAS (auto)
```

---

## Admin Verification Flow

### Verifikasi Pendaftaran

```
┌──────────┐
│  Admin   │
└────┬─────┘
     │
     ├──> View Pendaftaran List
     │         │
     │         └──> Filter by Status
     │                   │
     │                   ├──> MENUNGGU_VERIFIKASI
     │                   ├──> DITERIMA
     │                   ├──> DITOLAK
     │                   └──> DIBATALKAN
     │
     ├──> View Pendaftaran Details
     │         │
     │         ├──> Student Info (NIM, Name)
     │         ├──> Semester Info
     │         ├──> Courses List
     │         ├──> Total SKS & Biaya
     │         └──> Payment Status & Bukti
     │
     ├──> Update Status via /api/pendaftaran/[id] (PUT)
     │         │
     │         ├──> Check Authentication (Admin Only)
     │         │
     │         ├──> Validate Status
     │         │         │
     │         │         └──> Valid: MENUNGGU_VERIFIKASI, DITERIMA, DITOLAK, DIBATALKAN
     │         │
     │         ├──> Check Pendaftaran Exists
     │         │
     │         └──> Update Based on Status:
     │                   │
     │                   ├──> [DITOLAK]
     │                   │         │
     │                   │         └──> Transaction:
     │                   │                   │
     │                   │                   ├──> Update Status
     │                   │                   └──> Revert Quota (terisi -1)
     │                   │
     │                   ├──> [DITERIMA]
     │                   │         │
     │                   │         └──> Transaction:
     │                   │                   │
     │                   │                   ├──> Update Status
     │                   │                   └──> Update Payment Status → LUNAS
     │                   │                           │
     │                   │                           └──> Send Email Notification
     │                   │
     │                   └──> [Other Status]
     │                             │
     │                             └──> Just Update Status
     │
     └──> Status Updated
```

### Email Notification (When DITERIMA)

```
Admin Sets Status = DITERIMA
         │
         └──> Generate Email Content
                   │
                   ├──> Student Name
                   ├──> Semester Name
                   ├──> SPK Download Link
                   │         │
                   │         └──> /api/pendaftaran/[id]/spk
                   │
                   └──> Invoice Download Link
                             │
                             └──> /api/pendaftaran/[id]/invoice
         │
         └──> Send Email via Nodemailer
                   │
                   ├──> To: Student Email
                   ├──> Subject: "Pendaftaran Diterima - {Semester}"
                   └──> HTML: Email Template
         │
         └──> Email Sent (non-blocking, log error if fails)
```

---

## Email Notification Flow

### Types of Email

1. **Pendaftaran Diterima**
   - Trigger: Admin sets pendaftaran status = DITERIMA
   - Content: Student name, semester name, SPK link, Invoice link
   - Template: `getPendaftaranDiterimaEmailTemplate()`

2. **Forgot Password**
   - Trigger: User requests password reset
   - Content: Reset password link with token
   - Token: 64-character hex string, expires in 1 hour

3. **Password Reset Success**
   - Trigger: User successfully resets password
   - Content: Confirmation message

### Email Service Flow

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ├──> Call sendEmail()
       │         │
       │         ├──> Check Environment
       │         │         │
       │         │         ├──> [Development] ──> Log to Console
       │         │         │
       │         │         └──> [Production]
       │         │                   │
       │         │                   ├──> Check Email Service Type
       │         │                   │         │
       │         │                   │         ├──> [Gmail]
       │         │                   │         │         │
       │         │                   │         │         └──> Use Gmail SMTP
       │         │                   │         │
       │         │                   │         └──> [SMTP Custom]
       │         │                   │                   │
       │         │                   │                   └──> Use Custom SMTP
       │         │                   │
       │         │                   └──> Send via Nodemailer
       │         │
       │         └──> Return Promise
       │
       └──> Email Sent / Logged
```

---

## Session Management Flow

### Session Creation

```
Login / Register Success
         │
         └──> Create Session Cookie
                   │
                   ├──> Name: siakad_session
                   ├──> Value: JSON.stringify(userData)
                   │         │
                   │         └──> {id, nim, name, email, role, status}
                   │
                   ├──> httpOnly: true
                   ├──> secure: true (production) / false (development)
                   ├──> sameSite: 'lax'
                   ├──> maxAge: 7 days (604800 seconds)
                   └──> path: '/'
         │
         └──> Cookie Set in Response
```

### Session Validation

```
Request to Protected Route
         │
         └──> Middleware (proxy.ts)
                   │
                   ├──> Get Cookie: siakad_session
                   │         │
                   │         ├──> [Not Found] ──> Redirect to Login
                   │         │
                   │         └──> [Found]
                   │                   │
                   │                   ├──> Parse JSON
                   │                   │         │
                   │                   │         ├──> [Invalid] ──> Clear Cookie & Redirect
                   │                   │         │
                   │                   │         └──> [Valid]
                   │                   │                   │
                   │                   │                   ├──> Validate User Object
                   │                   │                   │         │
                   │                   │                   │         ├──> Check id exists
                   │                   │                   │         ├──> Check role exists
                   │                   │                   │         │
                   │                   │                   │         └──> [Invalid] ──> Clear Cookie & Redirect
                   │                   │                   │
                   │                   │                   └──> [Valid] ──> Check Role Access
                   │                   │
                   │                   └──> Allow Access / Redirect Based on Role
         │
         └──> Request Proceeds
```

### Session Destruction

```
Logout Request
         │
         └──> Call /api/auth/logout
                   │
                   └──> Clear Cookie
                             │
                             ├──> Set expires: new Date(0)
                             └──> Set value: ''
         │
         └──> Redirect to Login
```

---

## Flow Summary

### Complete User Journey (Mahasiswa)

1. **Registration**
   - Admin creates UserMaster with NIM
   - Mahasiswa self-registers with NIM, name, email, password
   - Account created, session set, auto-login

2. **Login**
   - Enter NIM & password
   - Verify credentials
   - Set session cookie
   - Redirect to dashboard

3. **Course Registration**
   - Browse available semester
   - Select courses (check quota)
   - Submit pendaftaran
   - Status: MENUNGGU_VERIFIKASI

4. **Payment**
   - Upload payment proof
   - Payment status: MENUNGGU_VERIFIKASI

5. **Admin Verification**
   - Admin reviews pendaftaran & payment
   - Admin sets status: DITERIMA
   - Payment auto-set to LUNAS
   - Email notification sent

6. **Download Documents**
   - Download SPK
   - Download Invoice

### Complete Admin Journey

1. **User Management**
   - Create UserMaster (NIM/NIP, role, status)
   - Optionally create Account with email
   - Edit/Delete users

2. **Semester Management**
   - Create semester (nama, periode, tanggal, deadline)
   - Set status: AKTIF/NONAKTIF

3. **Course Management**
   - Create MataKuliah (kode, nama, SKS, prodi)
   - Assign to semester (SemesterMataKuliah)
   - Set kelas, jadwal, dosen, kuota, biaya

4. **Registration Management**
   - View all pendaftaran
   - Filter by status
   - View details (courses, payment)
   - Verify pendaftaran (DITERIMA/DITOLAK)
   - Send email notification

5. **Schedule Management**
   - Manage jadwal kuliah
   - Update tanggal jadwal

---

## Security Considerations

1. **Authentication**
   - Password hashed with bcrypt (saltRounds=10)
   - Session stored in httpOnly cookie
   - Secure cookie in production (HTTPS)

2. **Authorization**
   - Role-based access control (RBAC)
   - Middleware checks on every request
   - API routes validate role

3. **Data Validation**
   - Input validation on all API routes
   - File type & size validation
   - SQL injection prevention (Prisma ORM)

4. **Session Security**
   - httpOnly cookie (no JavaScript access)
   - Secure flag in production
   - SameSite: 'lax' (CSRF protection)
   - Max age: 7 days

5. **File Upload**
   - File type validation (JPG, PNG, PDF)
   - File size limit (5MB)
   - Upload to Cloudinary (not local storage)
   - Rollback on failure

---

## Error Handling Flow

```
API Request
    │
    ├──> Try Block
    │         │
    │         └──> Business Logic
    │                   │
    │                   ├──> Validation Error ──> Return 400
    │                   ├──> Not Found ──> Return 404
    │                   ├──> Unauthorized ──> Return 401
    │                   ├──> Forbidden ──> Return 403
    │                   └──> Success ──> Return 200/201
    │
    └──> Catch Block
              │
              └──> Log Error
                        │
                        └──> Return 500 with Generic Message
```

---

## Notes

- Semua operasi database menggunakan Prisma ORM untuk type safety
- Transaction digunakan untuk operasi multi-step (pendaftaran, update status)
- Email notification bersifat non-blocking (tidak gagal request jika email gagal)
- Quota management otomatis (increment saat pendaftaran, decrement saat ditolak/dibatalkan)
- Payment status auto-update ke LUNAS saat pendaftaran diterima

