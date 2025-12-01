import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  // Validasi environment variables
  const hasGmailConfig = 
    process.env.EMAIL_SERVICE === 'gmail' && 
    process.env.EMAIL_USER && 
    process.env.EMAIL_PASSWORD;
  
  const hasSMTPConfig = 
    process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASSWORD;

  // Gmail configuration
  if (hasGmailConfig) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App password untuk Gmail
      },
      // Timeout configuration untuk Vercel
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000, // 5 seconds
      socketTimeout: 10000, // 10 seconds
    });
  }

  // SMTP configuration
  if (hasSMTPConfig) {
    const port = parseInt(process.env.SMTP_PORT || '587');
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Timeout configuration untuk Vercel
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000, // 5 seconds
      socketTimeout: 10000, // 10 seconds
      // TLS options
      tls: {
        rejectUnauthorized: false, // Untuk self-signed certificates
      },
    });
  }

  // Development: Mock transporter (log email instead of sending)
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user',
        pass: 'ethereal.pass',
      },
    });
  }

  // Production: Throw error if no email config
  throw new Error(
    'Email configuration tidak ditemukan. ' +
    'Set EMAIL_SERVICE=gmail dengan EMAIL_USER dan EMAIL_PASSWORD, ' +
    'atau set SMTP_HOST, SMTP_USER, dan SMTP_PASSWORD di environment variables.'
  );
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  // Jika development dan tidak ada email config, log saja
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER && !process.env.SMTP_HOST) {
    console.log('📧 Email would be sent:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('HTML:', options.html);
    if (options.attachments) {
      console.log('Attachments:', options.attachments.map(a => a.filename));
    }
    return;
  }

  let transporter;
  try {
    transporter = createTransporter();
  } catch (configError: any) {
    console.error('Email configuration error:', configError);
    throw new Error(
      `Konfigurasi email tidak valid: ${configError.message}. ` +
      'Pastikan environment variables sudah diset dengan benar di Vercel.'
    );
  }

  try {
    // Verify connection first (optional, but helps catch config errors early)
    if (process.env.NODE_ENV === 'production') {
      try {
        await transporter.verify();
        console.log('✅ Email server connection verified');
      } catch (verifyError: any) {
        console.error('❌ Email server verification failed:', verifyError);
        // Don't throw here, try to send anyway (some servers don't support verify)
      }
    }

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@itbyadika.ac.id',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      attachments: options.attachments,
    });

    console.log('✅ Email sent successfully:', {
      to: options.to,
      subject: options.subject,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('❌ Error sending email:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      to: options.to,
      subject: options.subject,
    });

    // Provide more specific error messages
    let errorMessage = 'Gagal mengirim email.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Autentikasi email gagal. Periksa EMAIL_USER/EMAIL_PASSWORD atau SMTP_USER/SMTP_PASSWORD.';
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Koneksi ke server email gagal. Periksa SMTP_HOST atau koneksi internet.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Alamat email tidak valid.';
    } else if (error.response) {
      errorMessage = `Server email menolak: ${error.response}`;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
}

