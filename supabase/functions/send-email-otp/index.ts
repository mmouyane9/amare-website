import { Resend } from "npm:resend@4.1.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "onboarding@resend.dev";
const SUBJECT = "رمز التحقق - الجمعية المغربية لهواة البحث والاستكشاف";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "A valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const otp = String(Math.floor(100000 + crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
    console.log(`[send-email-otp] OTP for ${email}: ${otp}`);

    const resend = new Resend(RESEND_API_KEY);
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>رمز التحقق</title>
      </head>
      <body style="margin:0;padding:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f4f7fc;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fc;padding:40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;padding:40px 36px;box-shadow:0 20px 60px rgba(18,59,120,0.08);">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <span style="display:inline-block;width:64px;height:64px;border-radius:50%;background:rgba(25,184,242,0.1);line-height:64px;font-size:30px;">🔐</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:22px;font-weight:800;color:#123B78;">رمز التحقق</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <p style="margin:0;font-size:15px;color:#5B6B7C;line-height:1.7;">
                      استخدم الرمز أدناه للتحقق من بريدك الإلكتروني
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <span style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg, rgba(25,184,242,0.06), rgba(18,59,120,0.06));border-radius:16px;border:1.5px solid rgba(25,184,242,0.12);font-size:36px;font-weight:900;letter-spacing:8px;color:#123B78;direction:ltr;">${otp}</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <p style="margin:0;font-size:13px;color:#8A9BB5;line-height:1.6;">
                      هذا الرمز صالح لمدة <strong style="color:#123B78;">دقيقتين</strong>. إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:13px;color:#B0BEC5;">
                      الجمعية المغربية لهواة البحث والاستكشاف
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: SUBJECT,
      html,
    });

    if (error) {
      console.error(`[send-email-otp] Resend error for ${email}:`, error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`[send-email-otp] Email sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[send-email-otp] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
