import { Resend } from "resend";

export const config = { runtime: "nodejs" };

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== "POST") {
      return Response.json({ success: false, message: "Method not allowed" }, { status: 405 });
    }

    let payload: { email?: string; otp?: string };
    try {
      payload = await req.json();
    } catch {
      return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    const { email, otp } = payload;

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ success: false, message: "A valid email is required" }, { status: 400 });
    }

    if (!otp || typeof otp !== "string") {
      return Response.json({ success: false, message: "An otp is required" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, message: "RESEND_API_KEY is not configured" },
        { status: 500 }
      );
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

    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || "AMARE <association@amare.ma>",
      to: [email],
      subject: "AMARE - رمز التحقق",
      html,
    });

    if (error) {
      return Response.json({ success: false, message: error.message }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return Response.json(
      {
        success: false,
        error: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
