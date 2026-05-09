"use server";

import { prisma } from "@/lib/db";

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
      rules: rules
    };
  } catch (error) {
    console.error("Check Transaction Error:", error);
    return { valid: false, message: "Terjadi kesalahan sistem saat mengecek transaksi." };
  }
}

import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
        const uploadsDir = path.join(process.cwd(), "storage/uploads/warranty");
        await mkdir(uploadsDir, { recursive: true });

        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${uniqueSuffix}-${photo.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = path.join(uploadsDir, filename);

        await writeFile(filePath, buffer);
        evidenceUrl = `/api/uploads/warranty/${filename}`;
        console.log(`[Warranty Upload] Success: ${evidenceUrl}`);
      } catch (uploadErr) {
        console.error("[Warranty Upload] Failed:", uploadErr);
        // Tetap lanjut meski upload gagal? Atau stop? 
        // Sebaiknya stop jika bukti foto wajib.
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

    return { success: true };
  } catch (error: any) {
    console.error("Submit Warranty Error:", error);
    return { success: false, message: `Gagal menyimpan klaim: ${error.message || "Kesalahan internal"}` };
  }
}
