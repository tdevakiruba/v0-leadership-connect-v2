import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "Leadership Reboot SIGNAL <info@transformerhub.com>"
const BASE_URL = "https://reboot.transformerhub.com"
const LOGO_URL = `${BASE_URL}/images/signal-logo.png`
const LOGO_NAME_URL = `${BASE_URL}/images/signal-logo-name.png`
const BRAND_NAVY = "#0a2540"
const BRAND_NAVY_LIGHT = "#143a5c"

export async function sendWelcomeEmail({
  to,
  name,
  endDate,
  amountPaid,
}: {
  to: string
  name: string
  endDate: Date
  amountPaid: number
}) {
  const formattedEndDate = endDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formattedAmount = `$${(amountPaid / 100).toFixed(2)}`

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Welcome to Leadership Reboot SIGNAL\u2122 \u2014 Your 90-Day Transformation Begins!",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Logo Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 32px 0; text-align: center;">
              <img src="${LOGO_URL}" alt="Leadership Reboot SIGNAL" width="64" height="64" style="display: block; margin: 0 auto 16px; border-radius: 50%;" />
              <img src="${LOGO_NAME_URL}" alt="Leadership Reboot SIGNAL Framework" width="280" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 20px 32px 0;">
              <hr style="border: none; border-top: 2px solid ${BRAND_NAVY}; width: 60px; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Welcome Banner -->
          <tr>
            <td style="padding: 28px 32px 0; text-align: center;">
              <h1 style="margin: 0; color: ${BRAND_NAVY}; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Welcome to the Next Level, ${name}.</h1>
              <p style="margin: 10px 0 0; color: #64748b; font-size: 15px;">Your 90-Day Leadership Reboot SIGNAL\u2122 journey begins now.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px 0;">
              <p style="margin: 0 0 18px; color: #334155; font-size: 15px; line-height: 1.7;">You have made a decisive investment in your leadership capacity. This program is designed to sharpen clarity, elevate strategic thinking, and strengthen the signal you bring into every room you lead.</p>
              <p style="margin: 0 0 18px; color: #334155; font-size: 15px; line-height: 1.7;">Effective leaders do not wait for transformation \u2014 they initiate it. Your access to <strong>Leadership Reboot SIGNAL\u2122</strong> is now fully activated.</p>
            </td>
          </tr>

          <!-- Details Card -->
          <tr>
            <td style="padding: 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin: 8px 0 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Program</td>
                        <td style="padding: 8px 0; color: ${BRAND_NAVY}; font-size: 14px; text-align: right; font-weight: 600;">Leadership Reboot SIGNAL\u2122</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Leadership Cycle</td>
                        <td style="padding: 8px 0; color: ${BRAND_NAVY}; font-size: 14px; text-align: right; font-weight: 600; border-top: 1px solid #e2e8f0;">90-Day Executive Reset</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Access active through</td>
                        <td style="padding: 8px 0; color: ${BRAND_NAVY}; font-size: 14px; text-align: right; font-weight: 600; border-top: 1px solid #e2e8f0;">${formattedEndDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Investment</td>
                        <td style="padding: 8px 0; color: ${BRAND_NAVY}; font-size: 14px; text-align: right; font-weight: 600; border-top: 1px solid #e2e8f0;">${formattedAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Steps -->
          <tr>
            <td style="padding: 0 32px;">
              <p style="margin: 0 0 12px; color: ${BRAND_NAVY}; font-size: 15px; line-height: 1.6; font-weight: 600;">Here is how strong leaders move forward:</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                <tr>
                  <td style="padding: 8px 12px 8px 0; vertical-align: top; color: ${BRAND_NAVY}; font-size: 16px; font-weight: 700;">1.</td>
                  <td style="padding: 8px 0; color: #334155; font-size: 14px; line-height: 1.6;"><strong>Enter your leadership dashboard.</strong> Begin Day 1 with intentional focus and strategic clarity.</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px 8px 0; vertical-align: top; color: ${BRAND_NAVY}; font-size: 16px; font-weight: 700;">2.</td>
                  <td style="padding: 8px 0; color: #334155; font-size: 14px; line-height: 1.6;"><strong>Execute the daily SIGNAL\u2122 practices.</strong> Each step is engineered to refine judgment, presence, and leadership discipline.</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px 8px 0; vertical-align: top; color: ${BRAND_NAVY}; font-size: 16px; font-weight: 700;">3.</td>
                  <td style="padding: 8px 0; color: #334155; font-size: 14px; line-height: 1.6;"><strong>Track your leadership signal.</strong> Measurable growth comes from consistent, focused execution.</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Closing Copy -->
          <tr>
            <td style="padding: 0 32px;">
              <p style="margin: 0 0 24px; color: #334155; font-size: 15px; line-height: 1.7;">Over the next 90 days, you will sharpen how you think, decide, communicate, and lead. The leaders who rise in this era are those who develop signal strength \u2014 clarity under pressure, alignment in complexity, and decisive action in uncertainty.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 28px;" align="center">
              <a href="${BASE_URL}/dashboard" style="display: inline-block; background-color: ${BRAND_NAVY}; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600;">Enter Leadership Dashboard \u2192</a>
            </td>
          </tr>

          <!-- Support Note -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6; text-align: center;">This is more than a program. It is a leadership standard.<br/>If you need support, simply reply \u2014 our team is here to ensure your momentum continues.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND_NAVY}; padding: 24px 32px; text-align: center;">
              <img src="${LOGO_URL}" alt="Leadership Reboot SIGNAL" width="36" height="36" style="display: block; margin: 0 auto 10px; border-radius: 50%;" />
              <p style="margin: 0 0 4px; color: #ffffff; font-size: 13px; font-weight: 600;">Leadership Reboot SIGNAL\u2122 Framework</p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">TransformerHub \u00b7 Empowering Leaders Worldwide</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    })

    if (error) {
      console.error("[v0] Failed to send welcome email:", error)
      return { success: false, error }
    }

    console.log("[v0] Welcome email sent successfully to:", to, "id:", data?.id)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error("[v0] Error sending welcome email:", error)
    return { success: false, error }
  }
}
