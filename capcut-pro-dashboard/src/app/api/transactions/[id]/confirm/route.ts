import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { parseDuration, calcWarrantyExpiry } from "@/lib/duration";
import { parseProductType } from "@/lib/product";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("page_transactions");
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    if (transaction.status === "success") {
      return NextResponse.json({ error: "Transaksi sudah sukses" }, { status: 400 });
    }

    const user = transaction.user;
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 400 });
    }

    const productTitle = transaction.productName || "CapCut Pro";
    const productData = await prisma.product.findFirst({
      where: { name: productTitle }
    });

    const durationDays = productData?.duration || parseDuration(productTitle) || 30;

    const txResult = await prisma.$transaction(async (tx) => {
      let account = null;
      
      // Ambil data stock berdasarkan relasi product (bukan product_type)
      let candidateAccounts = await tx.stockAccount.findMany({
        where: {
          status: "available",
          usageType: "sale",
          product: {
            name: { contains: productTitle, mode: "insensitive" }
          }
        },
        orderBy: [{ usedSlots: "asc" }, { createdAt: "asc" }],
      });

      // Jika tidak ketemu by relation, coba by productId (jika ada)
      if (candidateAccounts.length === 0 && productData?.id) {
        candidateAccounts = await tx.stockAccount.findMany({
          where: {
            productId: productData.id,
            status: "available",
            usageType: "sale",
          },
          orderBy: [{ usedSlots: "asc" }, { createdAt: "asc" }],
        });
      }

      // Pilih akun yang masih ada sisa slot berdasarkan kolom max_slots di tabel stock
      account = candidateAccounts.find(acc =>
        (acc.usedSlots ?? 0) < (acc.maxSlots ?? 3)
      ) ?? null;

      const purchaseDate = new Date();
      const warrantyExpiredAt = calcWarrantyExpiry(purchaseDate, durationDays);

      const updatedTrx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "success",
          stockAccountId: account?.id || null,
          purchaseDate,
          warrantyExpiredAt,
        },
      });

      if (account) {
        const accountMaxSlots = account.maxSlots ?? 3;
        const newUsedSlots = (account.usedSlots ?? 0) + 1;
        
        const updatedAccount = await tx.stockAccount.updateMany({
          where: {
            id: account.id,
            usedSlots: { lt: accountMaxSlots }
          },
          data: {
            usedSlots: { increment: 1 },
            status: newUsedSlots >= accountMaxSlots ? "sold" : "available",
          },
        });

        if (updatedAccount.count === 0) {
          throw new Error("SLOT_PENUH_RETRY");
        }
      }

      return { account, transaction: updatedTrx };
    });

    const { account } = txResult;

    // HIT URL APPSHEET (Same as in payment-success webhook)
    try {
      let waNumber = user.whatsapp || "";
      waNumber = waNumber.replace(/[^0-9]/g, "");
      if (waNumber.startsWith("0")) waNumber = "62" + waNumber.slice(1);
      if (!waNumber.startsWith("62")) waNumber = "62" + waNumber;

      let chatTemplate = productData?.messageTemplate || "Halo [nama],\n\nTerima kasih telah berlangganan [product] di Dorizz Store.\n\nDetail Akun:\nEmail: [email]\nPassword: [password]\n\nHarap simpan data ini dengan baik.";

      const processedMessage = chatTemplate
        .replace(/\[nama\]/g, user.name)
        .replace(/\[id_trx\]/g, transaction.id)
        .replace(/\[product\]/g, productTitle)
        .replace(/\[email\]/g, account?.accountEmail || "(Sedang diproses/Pre-order)")
        .replace(/\[password\]/g, account?.accountPassword || "(Sedang diproses/Pre-order)")
        .replace(/\[whatsapp\]/g, waNumber);

      await fetch("https://appsheetindonesia-dorrizstore.qxifii.easypanel.host/webhook/bf7fc32f-47cd-43c8-9b62-626948d502b7", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "nama user": user.name,
          "email user": user.email,
          "whatsapp user": waNumber,
          "akun capcut user": account?.accountEmail || "Pre-order",
          "passowrd capcut user": account?.accountPassword || "Pre-order",
          "pesan": processedMessage
        })
      });
    } catch (appsheetErr) {
      console.error("[Manual Confirm AppSheet] Gagal hit URL:", appsheetErr);
    }

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil dikonfirmasi secara manual",
      account: account?.accountEmail || null
    });

  } catch (error) {
    console.error("[Manual Confirm] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
