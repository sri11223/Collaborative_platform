import nodemailer from 'nodemailer';

// Create a reusable transporter
// For development, uses Ethereal (fake SMTP).
// For production, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars.
let transporter: nodemailer.Transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    // Production SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: use Ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Email dev mode: using Ethereal');
    console.log(`   User: ${testAccount.user}`);
  }

  return transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<string | null> {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || '"TaskFlow" <noreply@taskflow.app>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    // Log Ethereal preview URL in dev
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Preview: ${previewUrl}`);
    }

    return previewUrl ? String(previewUrl) : info.messageId;
  } catch (err) {
    console.error('Email send error:', err);
    return null;
  }
}

export function buildInviteEmail(params: {
  inviterName: string;
  boardTitle: string;
  role: string;
  inviteLink: string;
}) {
  return {
    subject: `${params.inviterName} invited you to "${params.boardTitle}" on TaskFlow`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSegoeUI,Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#6366f1;padding:32px 40px;">
      <h1 style="color:#fff;margin:0;font-size:24px;">TaskFlow</h1>
    </div>
    <div style="padding:32px 40px;">
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">You've been invited! 🎉</h2>
      <p style="color:#6b7280;line-height:1.6;margin:0 0 8px;">
        <strong style="color:#111827;">${params.inviterName}</strong> has invited you to collaborate on
        <strong style="color:#6366f1;">"${params.boardTitle}"</strong> as a <strong>${params.role}</strong>.
      </p>
      <p style="color:#6b7280;line-height:1.6;margin:0 0 24px;">
        Click the button below to accept the invitation and start collaborating.
      </p>
      <a href="${params.inviteLink}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:600;font-size:15px;">
        Accept Invitation
      </a>
      <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;line-height:1.5;">
        Or copy this link: <a href="${params.inviteLink}" style="color:#6366f1;">${params.inviteLink}</a>
      </p>
      <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">
        This invitation expires in 7 days.
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}
