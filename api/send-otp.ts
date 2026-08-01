import { Resend } from "resend";

type VercelRequest = {
  method?: string;
  body?: string | Buffer;
};

type VercelResponse = {
  status: (code: number) => { json: (payload: unknown) => void };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  const rawBody =
    typeof req.body === "string" ? req.body : req.body ? req.body.toString("utf-8") : "";

  let payload: { email?: string; otp?: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ success: false, message: "Invalid JSON body" });
    return;
  }

  const { email, otp } = payload;

  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({ success: false, message: "A valid email is required" });
    return;
  }

  if (!otp || typeof otp !== "string") {
    res.status(400).json({ success: false, message: "An otp is required" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ success: false, message: "RESEND_API_KEY is not configured" });
    return;
  }

  const resend = new Resend(apiKey);

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; direction: rtl;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;">
            <tr>
              <td align="center" style="padding: 32px 24px 8px 24px;">
                <h2 style="margin: 0; color: #1a1a2e; font-size: 24px;">جمعية AMARE</h2>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 16px 24px;">
                <p style="margin: 0 0 16px 0; color: #555555; font-size: 16px;">رمز التحقق الخاص بك هو:</p>
                <h1 style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 40px; letter-spacing: 4px;">${otp}</h1>
                <p style="margin: 0; color: #999999; font-size: 14px;">ينتهي الرمز خلال دقيقتين.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  let result: { data: { id: string } | null; error: { message: string } | null };
  try {
    result = await resend.emails.send({
      from: process.env.MAIL_FROM || "AMARE <onboarding@resend.dev>",
      to: [email],
      subject: "AMARE - رمز التحقق",
      html,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    res.status(500).json({ success: false, message });
    return;
  }

  if (result.error) {
    res.status(400).json({ success: false, message: result.error.message });
    return;
  }

  res.status(200).json({ success: true });
}
