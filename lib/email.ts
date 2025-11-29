import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  // Untuk development, gunakan SMTP atau service seperti Gmail
  // Untuk production, gunakan service seperti SendGrid, Resend, atau AWS SES
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App password untuk Gmail
      },
    });
  }

  // SMTP configuration
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Development: Mock transporter (log email instead of sending)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user',
      pass: 'ethereal.pass',
    },
  });
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transporter = createTransporter();

  // Jika development dan tidak ada email config, log saja
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER && !process.env.SMTP_HOST) {
    console.log('📧 Email would be sent:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('HTML:', options.html);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@itbyadika.ac.id',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Gagal mengirim email. Silakan coba lagi nanti.');
  }
}

