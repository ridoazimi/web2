"use server";

import { prisma } from "@/lib/db";
import { sendBarantumMessage } from "@/lib/barantum";

export async function checkTransactionValidity(orderId: string) {
  try {
    if (!orderId) return { valid: false, message: "Order ID tidak boleh kosong" };

    // Cek apakah orderId adalah UUID valid
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId);
    
    let transaction = null;
    if (isUuid) {
      transaction = await prisma.transaction.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          stockAccount: { include: { product: true } }
        }
      });
    } else {
      // Jika bukan UUID, coba cari di paymentData -> order_id (untuk KlikQRIS)
      transaction = await prisma.transaction.findFirst({
        where: {
          paymentData: {
            path: ['order_id'],
            equals: orderId
          }
        },
        include: {
          user: true,
          stockAccount: { include: { product: true } }
        }
      });
    }

    if (!transaction) {
      return { valid: false, message: "Transaksi tidak ditemukan. Pastikan Order ID benar." };
    }

    if (transaction.status !== "success") {
      return { valid: false, message: "Transaksi ini belum sukses/dibayar." };
    }

    if (transaction.warrantyExpiredAt && new Date() > transaction.warrantyExpiredAt) {
      return { valid: false, message: "Masa garansi untuk pesanan ini telah habis." };
    }

    // Ambil rules dari product jika ada
    let rules = transaction.stockAccount?.product?.rules || null;

    // Fallback: Cari product berdasarkan nama jika stockAccount tidak ada atau tidak punya product
    if (!rules && transaction.productName) {
      const product = await prisma.product.findFirst({
        where: { name: transaction.productName }
      });
      if (product) {
        rules = product.rules;
      }
    }

    return { 
      valid: true, 
      transactionId: transaction.id, // Kembalikan UUID asli
      productName: transaction.productName,
      purchaseDate: transaction.purchaseDate,
      warrantyExpiredAt: transaction.warrantyExpiredAt,
      oldAccountId: transaction.stockAccountId,
      rules: rules,
      customerName: transaction.user?.name || "Pelanggan",
      customerWhatsapp: transaction.user?.whatsapp || "-"
    };
  } catch (error) {
    console.error("Check Transaction Error:", error);
    return { valid: false, message: "Terjadi kesalahan sistem saat mengecek transaksi." };
  }
}

import { uploadImage } from "@/lib/upload";

export async function submitWarrantyClaim(formData: FormData) {
  try {
    const orderId = formData.get("orderId") as string;
    const oldAccountId = formData.get("oldAccountId") as string | null;
    const issue = formData.get("issue") as string;
    const photo = formData.get("photo") as File | null;

    if (!orderId) return { success: false, message: "Order ID tidak boleh kosong" };

    // Validasi ulang transaksi untuk mendapatkan UUID asli
    const checkResult = await checkTransactionValidity(orderId);
    if (!checkResult.valid || !checkResult.transactionId) {
      return { success: false, message: checkResult.message || "Transaksi tidak valid" };
    }

    const realTransactionId = checkResult.transactionId;

    // Cek apakah sudah ada klaim pending
    const existingPending = await prisma.warrantyClaim.findFirst({
      where: { transactionId: realTransactionId, status: "pending" }
    });

    if (existingPending) {
      return { success: false, message: "Klaim garansi untuk transaksi ini sudah ada dan sedang menunggu proses admin." };
    }

    let evidenceUrl = null;
    if (photo && photo.size > 0) {
      try {
        evidenceUrl = await uploadImage(photo, "warranty");
        console.log(`[Warranty Upload] Success: ${evidenceUrl}`);
      } catch (uploadErr) {
        console.error("[Warranty Upload] Failed:", uploadErr);
        return { success: false, message: "Gagal mengunggah foto bukti. Silakan coba lagi." };
      }
    }

    await prisma.warrantyClaim.create({
      data: {
        transaction: { connect: { id: realTransactionId } },
        ...(oldAccountId ? { oldAccount: { connect: { id: oldAccountId } } } : {}),
        claimReason: issue,
        evidenceUrl: evidenceUrl,
        status: "pending"
      }
    });

    // Kirim notifikasi WhatsApp ke Admin via Barantum jika nomor admin dikonfigurasi
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
    if (adminPhone) {
      const customerName = checkResult.customerName || "Pelanggan";
      const customerWhatsapp = checkResult.customerWhatsapp || "-";
      const productName = checkResult.productName || "CapCut Pro";
      const refId = orderId; // Input yang dimasukkan customer (bisa Ref ID atau UUID)

      const adminMessage = `🚨 *NOTIFIKASI KLAIM GARANSI BARU* 🚨\n\n` +
        `Ada pengajuan klaim garansi baru dari pelanggan:\n\n` +
        `👤 *Nama:* ${customerName}\n` +
        `📞 *WhatsApp:* ${customerWhatsapp}\n` +
        `📦 *Produk:* ${productName}\n` +
        `🆔 *Order ID/Ref:* ${refId}\n` +
        `📝 *Alasan:* ${issue}\n\n` +
        `Silakan cek dashboard admin untuk memproses klaim ini.`;

      sendBarantumMessage(adminPhone, adminMessage).catch((err) => {
        console.error("[Barantum Admin Notification Error]:", err);
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Submit Warranty Error:", error);
    return { success: false, message: `Gagal menyimpan klaim: ${error.message || "Kesalahan internal"}` };
  }
}
