/**
 * Email templates untuk aplikasi
 */

export function getResetPasswordEmailTemplate(
  userName: string,
  resetLink: string
): string {
  const appName = 'Siakad ITB YADIKA';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Gunakan CDN Supabase untuk logo (accessible dari internet)
  const logoUrl =
    'https://lolnjgstuwbktisdrday.supabase.co/storage/v1/object/public/logo/itb-yadika.png';

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - ${appName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <!-- Logo - gunakan table untuk better email client compatibility -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-right: 12px;">
                  <tr>
                    <td style="padding: 0;">
                      <img 
                        src="${logoUrl}" 
                        alt="ITB YADIKA" 
                        style="height: 40px; width: auto; max-width: 120px; display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" 
                        width="40"
                        height="40"
                      />
                    </td>
                  </tr>
                </table>
                <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">${appName}</h1>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <!-- Icon & Title -->
              <div style="display: flex; align-items: center; margin-bottom: 24px;">
                <!-- Checkmark icon dari CDN -->
                <img 
                  src="https://lolnjgstuwbktisdrday.supabase.co/storage/v1/object/public/logo/check.png" 
                  alt="Check" 
                  style="width: 48px; height: 48px; margin-right: 16px; display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" 
                  width="48"
                  height="48"
                />
                <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">Mari Verifikasi!</h2>
              </div>

              <!-- Body Text -->
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Halo <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Kami menerima permintaan untuk mereset password akun Anda. Untuk memastikan keamanan akun Anda, silakan klik tombol di bawah ini untuk melanjutkan proses reset password.
              </p>

              <!-- CTA Button -->
              <div style="margin: 32px 0;">
                <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center;">
                  Klik di Sini untuk Reset Password
                  <span style="margin-left: 8px;">→</span>
                </a>
              </div>

              <!-- Warning Text -->
              <p style="margin: 24px 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                Link ini akan kedaluwarsa dalam <strong>24 jam</strong> untuk keamanan Anda. Jika Anda tidak meminta reset password, silakan abaikan email ini.
              </p>

              <!-- Closing -->
              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Terima kasih telah menggunakan ${appName}. Mari kita buat pengalaman web Anda lebih baik, bersama.
              </p>
              <p style="margin: 16px 0 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Salam,<br>
                <strong>Tim ${appName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #9ca3af; text-align: center;">
                Terlalu banyak email? <a href="${appUrl}/auth/unsubscribe" style="color: #3b82f6; text-decoration: underline;">Berhenti berlangganan</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
