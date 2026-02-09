export function getPasswordResetEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: 'Reset your Decantd password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#faf7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf7f2;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#722F37;">Decantd</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h2 style="margin:0;font-size:20px;font-weight:600;color:#1a1a1a;">Reset your password</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4a4a4a;">
                We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background-color:#722F37;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
                Reset Password
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:#888888;">
                If you didn't request this, you can safely ignore this email. Your password won't change.
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#888888;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color:#722F37;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };
}
