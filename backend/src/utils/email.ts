// SendGrid email service
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'noreply@taskflow.app';
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

async function sendToSendGrid(to: string, subject: string, html: string) {
  if (!SENDGRID_API_KEY) {
    console.warn('⚠️  SENDGRID_API_KEY not set - email not sent');
    return null;
  }

  try {
    const response = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: SENDGRID_FROM },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    if (response.status === 202) {
      console.log(`✅ Email sent to ${to}`);
      return 'sent';
    } else {
      const error = await response.text();
      console.error('SendGrid error:', error);
      return null;
    }
  } catch (err) {
    console.error('SendGrid API error:', err);
    return null;
  }
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<string | null> {
  return sendToSendGrid(options.to, options.subject, options.html);
}

export function buildInviteEmail(params: {
  inviterName: string;
  boardTitle: string;
  role: string;
  inviteLink: string;
}) {
  return {
    subject: `${params.inviterName} invited you to "${params.boardTitle}" on TaskFlow`,
    html: buildEmailTemplate({
      title: "You've been invited! 🎉",
      content: `
        <p style="color:#6b7280;line-height:1.6;margin:0 0 8px;">
          <strong style="color:#111827;">${params.inviterName}</strong> has invited you to collaborate on
          <strong style="color:#6366f1;">"${params.boardTitle}"</strong> as a <strong>${params.role}</strong>.
        </p>
        <p style="color:#6b7280;line-height:1.6;margin:0 0 24px;">
          Click the button below to accept the invitation and start collaborating.
        </p>`,
      ctaText: 'Accept Invitation',
      ctaLink: params.inviteLink,
      footer: `
        <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;line-height:1.5;">
          Or copy this link: <a href="${params.inviteLink}" style="color:#6366f1;">${params.inviteLink}</a>
        </p>
        <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">
          This invitation expires in 7 days.
        </p>`,
    }),
  };
}

export function buildWelcomeEmail(userName: string, loginLink: string) {
  return {
    subject: 'Welcome to TaskFlow! 🚀',
    html: buildEmailTemplate({
      title: 'Welcome to TaskFlow!',
      content: `
        <p style="color:#6b7280;line-height:1.6;margin:0 0 8px;">
          Hi <strong style="color:#111827;">${userName}</strong>,
        </p>
        <p style="color:#6b7280;line-height:1.6;margin:0 0 16px;">
          Thanks for joining TaskFlow! Your account has been created successfully.
        </p>
        <p style="color:#6b7280;line-height:1.6;margin:0 0 24px;">
          Start creating boards, organizing tasks, and collaborating with your team.
        </p>`,
      ctaText: 'Get Started',
      ctaLink: loginLink,
    }),
  };
}

export function buildTaskAssignedEmail(params: {
  assigneeName: string;
  taskTitle: string;
  assignerName: string;
  boardTitle: string;
  taskLink: string;
}) {
  return {
    subject: `You've been assigned to "${params.taskTitle}"`,
    html: buildEmailTemplate({
      title: 'New Task Assignment 📋',
      content: `
        <p style="color:#6b7280;line-height:1.6;margin:0 0 8px;">
          Hi <strong style="color:#111827;">${params.assigneeName}</strong>,
        </p>
        <p style="color:#6b7280;line-height:1.6;margin:0 0 16px;">
          <strong style="color:#111827;">${params.assignerName}</strong> assigned you to
          <strong style="color:#6366f1;">"${params.taskTitle}"</strong>
          on board <strong>"${params.boardTitle}"</strong>.
        </p>`,
      ctaText: 'View Task',
      ctaLink: params.taskLink,
    }),
  };
}

export function buildCommentEmail(params: {
  recipientName: string;
  commenterName: string;
  taskTitle: string;
  commentPreview: string;
  taskLink: string;
}) {
  return {
    subject: `New comment on "${params.taskTitle}"`,
    html: buildEmailTemplate({
      title: 'New Comment 💬',
      content: `
        <p style="color:#6b7280;line-height:1.6;margin:0 0 8px;">
          Hi <strong style="color:#111827;">${params.recipientName}</strong>,
        </p>
        <p style="color:#6b7280;line-height:1.6;margin:0 0 16px;">
          <strong style="color:#111827;">${params.commenterName}</strong> commented on
          <strong style="color:#6366f1;">"${params.taskTitle}"</strong>:
        </p>
        <div style="background:#f3f4f6;border-left:3px solid #6366f1;padding:12px 16px;margin:0 0 24px;border-radius:4px;">
          <p style="color:#374151;margin:0;font-style:italic;">"${params.commentPreview}"</p>
        </div>`,
      ctaText: 'View Comment',
      ctaLink: params.taskLink,
    }),
  };
}

export function buildNotificationEmail(params: {
  recipientName: string;
  notificationTitle: string;
  notificationMessage: string;
  actionLink?: string;
}) {
  return {
    subject: params.notificationTitle,
    html: buildEmailTemplate({
      title: params.notificationTitle,
      content: `
        <p style="color:#6b7280;line-height:1.6;margin:0 0 8px;">
          Hi <strong style="color:#111827;">${params.recipientName}</strong>,
        </p>
        <p style="color:#6b7280;line-height:1.6;margin:0 0 24px;">
          ${params.notificationMessage}
        </p>`,
      ctaText: params.actionLink ? 'View Details' : undefined,
      ctaLink: params.actionLink,
    }),
  };
}

// Base email template
function buildEmailTemplate(params: {
  title: string;
  content: string;
  ctaText?: string;
  ctaLink?: string;
  footer?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemUI,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#6366f1;padding:32px 40px;">
      <h1 style="color:#fff;margin:0;font-size:24px;">TaskFlow</h1>
    </div>
    <div style="padding:32px 40px;">
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">${params.title}</h2>
      ${params.content}
      ${params.ctaText && params.ctaLink ? `
      <a href="${params.ctaLink}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:600;font-size:15px;">
        ${params.ctaText}
      </a>` : ''}
      ${params.footer || ''}
    </div>
    <div style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
        TaskFlow - Real-Time Task Collaboration Platform
      </p>
    </div>
  </div>
</body>
</html>`;
}
