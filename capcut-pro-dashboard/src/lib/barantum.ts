/**
 * Barantum Chat API Helper
 * Used to send WhatsApp notifications via Barantum Omnichannel API
 */

export async function sendBarantumMessage(
  whatsappNumber: string,
  messageText: string,
  agentId: string = ""
): Promise<{ success: boolean; data?: any; error?: string }> {
  const companyUuid = process.env.BARANTUM_COMPANY_UUID;
  const botIdStr = process.env.BARANTUM_BOT_ID;

  if (!companyUuid || !botIdStr) {
    console.error("[Barantum] API credentials not configured in environment variables (BARANTUM_COMPANY_UUID, BARANTUM_BOT_ID).");
    return { success: false, error: "Credentials missing" };
  }

  const botId = parseInt(botIdStr, 10);
  if (isNaN(botId)) {
    console.error(`[Barantum] Invalid bot_id configured: ${botIdStr}`);
    return { success: false, error: "Invalid bot_id" };
  }

  // Format WhatsApp number to 62...
  let cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.substring(1);
  }
  if (!cleanNumber.startsWith("62")) {
    cleanNumber = "62" + cleanNumber;
  }

  const payload = {
    chats_users_id: cleanNumber,
    chats_message_text: messageText,
    type: "text",
    channel: "wa",
    company_uuid: companyUuid,
    chats_bot_id: botId,
    agent_id: agentId,
  };

  try {
    console.log(`[Barantum] Sending WhatsApp message to ${cleanNumber}...`);
    const res = await fetch("https://api-chat.barantum.com/api/v1/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log(`[Barantum] Raw response: ${text}`);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (res.ok) {
      console.log(`[Barantum] WhatsApp message successfully sent to ${cleanNumber}`);
      return { success: true, data };
    } else {
      console.error(`[Barantum] Failed to send message: ${text}`);
      return { success: false, error: data.message || text || "Failed to send message" };
    }
  } catch (error) {
    console.error("[Barantum] Error calling send-message API:", error);
    return { success: false, error: String(error) };
  }
}
