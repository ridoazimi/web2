require('dotenv').config();

async function testBarantum() {
  const companyUuid = process.env.BARANTUM_COMPANY_UUID || "3f4233d0dd5d5f6634485a5f86b0caaa7d7ffc0a3f0066eea6a161b104e2cf53";
  const botId = parseInt(process.env.BARANTUM_BOT_ID || "2678");
  const waNumber = "6285155318891"; // I fixed 61 to 62 assuming it's Indo
  const waMessage = "TEST MESSAGE DARI LOKAL";

  console.log("Testing Barantum...");
  try {
    const res = await fetch("https://api-chat.barantum.com/api/v1/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chats_users_id: waNumber,
        chats_message_text: waMessage,
        channel: "wa",
        company_uuid: companyUuid,
        chats_bot_id: botId
      })
    });
    
    const data = await res.json();
    console.log("Barantum Status:", res.status);
    console.log("Barantum Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Barantum Fetch Error:", err);
  }
}

async function testBrevo() {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.log("BREVO_API_KEY not found in .env");
    return;
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "hello@brevo.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Dorizz Store";
  const toEmail = "bisrimustofa312@gmail.com";

  console.log("\nTesting Brevo...");
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "content-type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: "Test User" }],
        subject: "Test Email dari Lokal",
        htmlContent: "<p>Hello, this is a test email.</p>"
      })
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        console.log("Brevo Error Status:", res.status);
        console.log("Brevo Error Data:", JSON.stringify(errorData, null, 2));
    } else {
        const data = await res.json();
        console.log("Brevo Success:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Brevo Fetch Error:", err);
  }
}

async function main() {
  await testBarantum();
  await testBrevo();
}

main();
