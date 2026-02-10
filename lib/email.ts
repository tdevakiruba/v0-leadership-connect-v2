import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "Leadership Reboot SIGNAL <noreply@transformerhub.com>"

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
      subject: "Welcome to Leadership Reboot SIGNAL - Your 90-Day Transformation Begins!",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f3d3e 0%, #1a5c5e 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                Welcome Aboard, ${name}!
              </h1>
              <p style="margin: 12px 0 0; color: #a7d8d8; font-size: 15px;">
                Your 90-Day Leadership Transformation begins now.
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px; color: #334155; font-size: 15px; line-height: 1.6;">
                Thank you for investing in your leadership journey. You now have full access to the Leadership Reboot SIGNAL&trade; program.
              </p>
              
              <!-- Details Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Program</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">Leadership Reboot SIGNAL&trade;</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Duration</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">90 Days</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Access until</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">${formattedEndDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Amount paid</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">${formattedAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Here is what to expect:
              </p>
              
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                <tr>
                  <td style="padding: 4px 12px 4px 0; vertical-align: top; color: #0f3d3e; font-size: 16px;">1.</td>
                  <td style="padding: 4px 0; color: #334155; font-size: 14px; line-height: 1.5;"><strong>Log in to your dashboard</strong> to start Day 1 of your transformation.</td>
                </tr>
                <tr>
                  <td style="padding: 4px 12px 4px 0; vertical-align: top; color: #0f3d3e; font-size: 16px;">2.</td>
                  <td style="padding: 4px 0; color: #334155; font-size: 14px; line-height: 1.5;"><strong>Follow the daily exercises</strong> designed to build lasting leadership habits.</td>
                </tr>
                <tr>
                  <td style="padding: 4px 12px 4px 0; vertical-align: top; color: #0f3d3e; font-size: 16px;">3.</td>
                  <td style="padding: 4px 0; color: #334155; font-size: 14px; line-height: 1.5;"><strong>Track your progress</strong> as you develop your leadership signal.</td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="https://reboot.transformerhub.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0f3d3e 0%, #1a5c5e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                      Start Day 1 &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5; text-align: center;">
                If you have any questions, reply to this email and our team will be happy to help.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                Leadership Reboot SIGNAL&trade; &middot; TransformerHub
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
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
