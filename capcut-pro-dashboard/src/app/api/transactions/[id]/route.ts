import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";

// PATCH /api/transactions/[id] - Ubah status transaksi (dengan pelepasan slot akun jika dari success ke pending/failed)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("page_transactions");
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["success", "pending", "failed"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid. Gunakan success, pending, atau failed." }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { stockAccount: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    // Jika status benar-benar berubah
    if (transaction.status !== status) {
      await prisma.$transaction(async (tx) => {
        // Jika status lama 'success' dan status baru bukan 'success', kurangi slot akun terpakai
        if (transaction.status === "success" && status !== "success" && transaction.stockAccountId) {
          const acc = transaction.stockAccount;
          if (acc) {
            const newUsedSlots = Math.max(0, (acc.usedSlots ?? 1) - 1);
            const defaultMaxSlots = acc.maxSlots ?? 3;
            
            await tx.stockAccount.update({
              where: { id: transaction.stockAccountId },
              data: {
                usedSlots: newUsedSlots,
                status: newUsedSlots >= defaultMaxSlots ? "sold" : "available",
              },
            });
          }

          // Kosongkan alokasi akun pada transaksi karena status tidak lagi sukses
          await tx.transaction.update({
            where: { id },
            data: {
              status,
              stockAccountId: null,
              warrantyExpiredAt: null,
            },
          });
        } else {
          // Hanya update status saja
          await tx.transaction.update({
            where: { id },
            data: { status },
          });
        }
      });
    }

    return NextResponse.json({ success: true, message: "Status transaksi berhasil diperbarui" });
  } catch (error) {
    console.error("PATCH /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
