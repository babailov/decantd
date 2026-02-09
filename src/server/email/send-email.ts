import { getCloudflareContext } from '@opennextjs/cloudflare';

import { isDevEnvironment } from '@/common/constants/environment';

async function getResendApiKey(): Promise<string | null> {
  if (isDevEnvironment) {
    try {
      const ctx = await getCloudflareContext();
      return ctx.env.RESEND_API_KEY || null;
    } catch {
      return process.env.RESEND_API_KEY || null;
    }
  }

  const { env } = await getCloudflareContext();
  return env.RESEND_API_KEY || null;
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = await getResendApiKey();
  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Decantd <noreply@updates.decantd.app>',
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}
