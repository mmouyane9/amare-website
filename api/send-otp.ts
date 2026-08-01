import { Resend } from "resend";

export const config = { runtime: "nodejs" };
export const maxDuration = 30;

const SEND_TIMEOUT_MS = 20000;

export default async function handler(req: Request): Promise<Response> {
  try {
    console.log("STEP 1: handler invoked, method =", req.method, "url =", req.url);

    if (req.method !== "POST") {
      console.log("STEP 1b: non-POST request rejected");
      return Response.json({ success: false, message: "Method not allowed" }, { status: 405 });
    }

    console.log("STEP 2: reading request body...");
    let payload: { email?: string; otp?: string };
    try {
      payload = await req.json();
    } catch (err) {
      console.log("STEP 2b: invalid JSON body", err instanceof Error ? err.message : err);
      return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    const { email, otp } = payload;
    console.log("STEP 3: parsed body -> email =", email, ", otp =", otp, ", emailType =", typeof email, ", otpType =", typeof otp);

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      console.log("STEP 4: email validation failed");
      return Response.json({ success: false, message: "A valid email is required" }, { status: 400 });
    }

    if (!otp || typeof otp !== "string") {
      console.log("STEP 4b: otp validation failed");
      return Response.json({ success: false, message: "An otp is required" }, { status: 400 });
    }

    console.log("STEP 5: reading RESEND_API_KEY...");
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("STEP 5b: RESEND_API_KEY is MISSING from process.env");
      return Response.json(
        { success: false, message: "RESEND_API_KEY is not configured" },
        { status: 500 }
      );
    }
    console.log("STEP 5c: RESEND_API_KEY is present, length =", apiKey.length, ", prefix =", apiKey.slice(0, 4), "...");

    const from = process.env.MAIL_FROM || "AMARE <association@amare.ma>";
    console.log("STEP 6: sender (from) =", from);
    console.log("STEP 7: recipient (to) =", email);

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

    console.log("STEP 8: calling resend.emails.send({ from, to, subject: 'AMARE - رمز التحقق', html }) ...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("STEP 8b: Resend call TIMED OUT after", SEND_TIMEOUT_MS, "ms, aborting...");
      controller.abort();
    }, SEND_TIMEOUT_MS);

    let result: { data: { id: string } | null; error: { name?: string; message: string; statusCode?: number | null } | null };
    try {
      result = await resend.emails.send(
        {
          from,
          to: [email],
          subject: "AMARE - رمز التحقق",
          html,
        },
        { signal: controller.signal }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send email";
      console.log("STEP 8c: resend.emails.send THREW:", message);
      return Response.json({ success: false, resendResponse: null, resendError: { message, name: "exception" } }, { status: 500 });
    } finally {
      clearTimeout(timeoutId);
    }

    console.log("STEP 9: Resend response =", JSON.stringify(result));
    console.log("STEP 9b: resendError =", result.error ? JSON.stringify(result.error) : "null", ", resendResponse =", result.data ? JSON.stringify(result.data) : "null");

    if (result.error) {
      return Response.json(
        {
          success: false,
          resendResponse: result.data,
          resendError: result.error,
        },
        { status: 400 }
      );
    }

    console.log("STEP 10: success, email id =", result.data ? result.data.id : "unknown");
    return Response.json({ success: true, resendResponse: result.data, resendError: null });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.log("STEP CATCH: uncaught exception:", err.message);
    console.log(err.stack);
    return Response.json(
      {
        success: false,
        error: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
