import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const targetEmail = url.searchParams.get("email") || "test-dorizz@yopmail.com";

    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "dorizztim@gmail.com";
    const senderName = process.env.BREVO_SENDER_NAME || "Tim Dorizz";

    const payload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: targetEmail, name: "Test User" }],
      subject: "Test Email from Next.js",
      htmlContent: "<h2>Test Berhasil!</h2><p>Jika Anda melihat ini, integrasi Brevo API Anda berfungsi dengan baik.</p>"
    };

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey || "",
        "content-type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const isOk = brevoRes.ok;
    const data = await brevoRes.json().catch(() => null);

    return NextResponse.json({
      success: isOk,
      statusCode: brevoRes.status,
      data,
      env: {
        hasApiKey: !!brevoApiKey,
        senderEmail,
        senderName
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
