2. Perbaikan Redirect Pembayaran Xendit
   - Saat pembayaran berhasil (payment success) dari Xendit, user seharusnya langsung diarahkan ke halaman **Success Screen**.
   - Saat ini user malah kembali ke halaman login.
   - Perbaiki alur redirect agar:
     payment success → success page
     bukan → login page.

3. Validasi Mhs Jika Mhs Sudah daftar matkul, maka tidak bisa lagi mendaftar dengan matkul yg sama. atau disable, kalo sudah di set selesai di jadwal maka bisa daftar kembali.
