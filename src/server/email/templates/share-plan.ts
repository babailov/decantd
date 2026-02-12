interface SharePlanEmailInput {
  planTitle: string;
  occasion: string;
  description: string;
  wines: {
    varietal: string;
    region: string;
    estimatedPriceMin: number;
    estimatedPriceMax: number;
    tastingOrder: number;
  }[];
  totalEstimatedCostMin: number;
  totalEstimatedCostMax: number;
  planUrl: string;
  senderName?: string;
}

export function getSharePlanEmail(input: SharePlanEmailInput): {
  subject: string;
  html: string;
} {
  const fromLine = input.senderName
    ? `${input.senderName} shared a wine tasting plan with you`
    : 'Someone shared a wine tasting plan with you';

  const subject = input.senderName
    ? `${input.senderName} shared a wine tasting plan: ${input.planTitle}`
    : `Check out this wine tasting plan: ${input.planTitle}`;

  const wineRows = input.wines
    .map(
      (w) => `
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #f0ebe4;">
              <div style="display:flex;align-items:center;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#7B2D3A;color:#ffffff;font-size:12px;font-weight:700;text-align:center;line-height:24px;margin-right:12px;">${w.tastingOrder}</span>
                <div>
                  <div style="font-size:15px;font-weight:600;color:#2C1810;">${w.varietal}</div>
                  <div style="font-size:13px;color:#6B5E54;">${w.region} · $${w.estimatedPriceMin}–$${w.estimatedPriceMax}</div>
                </div>
              </div>
            </td>
          </tr>`,
    )
    .join('');

  const totalLine =
    input.totalEstimatedCostMin > 0
      ? `<p style="margin:0;padding:12px 16px;font-size:14px;color:#6B5E54;text-align:right;">Estimated total: $${input.totalEstimatedCostMin}–$${input.totalEstimatedCostMax}</p>`
      : '';

  return {
    subject,
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#7B2D3A;padding:24px 32px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Decantd</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:14px;color:#6B5E54;">${fromLine}</p>
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2C1810;">${input.planTitle}</h2>
              <p style="margin:0 0 4px;font-size:14px;color:#6B5E54;">${input.occasion}</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">${input.description}</p>

              <!-- Wine list -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf7f2;border-radius:12px;overflow:hidden;margin-bottom:16px;">
                ${wineRows}
              </table>
              ${totalLine}

              <!-- CTA -->
              <div style="text-align:center;padding-top:16px;">
                <a href="${input.planUrl}" style="display:inline-block;padding:14px 36px;background-color:#7B2D3A;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;">
                  View Full Plan
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f0ebe4;">
              <p style="margin:0;font-size:12px;color:#999;text-align:center;">
                Sent via <a href="https://decantd.app" style="color:#7B2D3A;text-decoration:none;">Decantd</a> — Personalized Wine Tasting Planner
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
