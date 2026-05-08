import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";

const WARRANTY_WEBHOOK_URL =
  "https://appsheetindonesia-dorrizstore.qxifii.easypanel.host/webhook/25ef64ae-a473-4f33-9549-d4a86138d14e";

async function sendWarrantyWebhook(payload: {
  nama: string;
  email: string;
  no_hp: string;
  akun_email: string;
  akun_password: string;
  alasan_klaim: string;
  tanggal_klaim: string;
}) {
  try {
    await fetch(WARRANTY_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("[Warranty Webhook] Berhasil dikirim untuk:", payload.email);
  } catch (err) {
    console.error("[Warranty Webhook] Gagal mengirim webhook:", err);
  }
}

// GET /api/warranty - Ambil semua klaim garansi
export async function GET(req: NextRequest) {
  const auth = await requirePermission("page_warranty");
  if ("error" in auth) return auth.error;
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { transaction: { user: { name: { contains: search, mode: "insensitive" } } } },
        { transaction: { user: { whatsapp: { contains: search } } } },
        { transaction: { lynkIdRef: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [claims, total] = await Promise.all([
      prisma.warrantyClaim.findMany({
        where,
        include: {
          transaction: {
            include: { 
              user: { select: { name: true, whatsapp: true } },
              stockAccount: { select: { productId: true } }
            },
          },
          oldAccount: { select: { accountEmail: true } },
          newAccount: { select: { accountEmail: true, accountPassword: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.warrantyClaim.count({ where }),
    ]);

    return NextResponse.json({ claims, total, page, limit });
  } catch (error) {
    console.error("GET /api/warranty error:", error);
    return NextResponse.json({ error: "Gagal mengambil data klaim" }, { status: 500 });
  }
}

// POST /api/warranty - Proses klaim garansi baru
export async function POST(req: NextRequest) {
  const auth = await requirePermission("page_warranty");
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    const { transactionId, claimReason } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "ID transaksi wajib diisi" }, { status: 400 });
    }

    // 1. Ambil transaksi dan akun lama (include user dengan email)
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        stockAccount: { include: { product: true } },
        user: { select: { name: true, email: true, whatsapp: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }


    // Cek jika ada klaim PENDING untuk transaksi yang sama
    const pendingClaim = await prisma.warrantyClaim.findFirst({
      where: { transactionId, status: "pending" },
    });

    // 2. Tentukan productType dari akun lama agar akun pengganti sesuai tipe produk
    const oldProductType = transaction.stockAccount?.product?.productType ?? "mobile";
    const oldProductId = transaction.stockAccount?.productId;
    const defaultMaxSlots = oldProductType === "desktop" ? 2 : 3;

    // Cari akun baru yang tersedia dengan productType yang SAMA
    // PENTING: exclude akun lama agar tidak reassign akun yang sama!
    const candidateAccounts = await prisma.stockAccount.findMany({
      where: {
        status: "available",
        productId: oldProductId,
        usageType: "warranty",
        ...(transaction.stockAccountId ? { id: { not: transaction.stockAccountId } } : {}),
      },
      orderBy: [{ usedSlots: "asc" }, { createdAt: "asc" }],
    });

    const newAccount = candidateAccounts.find(acc =>
      (acc.usedSlots ?? 0) < (acc.maxSlots ?? defaultMaxSlots)
    ) ?? null;

    if (!newAccount) {
      return NextResponse.json({ error: `Stok akun ${oldProductType} habis! Semua akun ${oldProductType} sudah penuh.` }, { status: 400 });
    }

    // 3. Buat atau update klaim garansi
    let claim;
    if (pendingClaim) {
      claim = await prisma.warrantyClaim.update({
        where: { id: pendingClaim.id },
        data: {
          newAccountId: newAccount.id,
          status: "resolved",
          claimReason: claimReason || pendingClaim.claimReason,
        },
        include: {
          oldAccount: true,
          newAccount: true,
        },
      });
    } else {
      claim = await prisma.warrantyClaim.create({
        data: {
          transactionId,
          oldAccountId: transaction.stockAccountId,
          newAccountId: newAccount.id,
          claimReason: claimReason || "Tidak disebutkan",
          status: "resolved",
        },
        include: {
          oldAccount: true,
          newAccount: true,
        },
      });
    }

    // 4. Update akun lama: kurangi slot, jangan ban jika masih ada sisa slot
    if (transaction.stockAccountId) {
      const oldAccount = transaction.stockAccount;
      const currentUsedSlots = oldAccount?.usedSlots ?? 1;
      const oldMaxSlots = oldAccount?.maxSlots ?? defaultMaxSlots;
      const newUsedSlotsOld = Math.max(0, currentUsedSlots - 1);

      // Status: selalu available jika masih ada slot kosong
      const oldAccountStatus = "available";

      await prisma.stockAccount.update({
        where: { id: transaction.stockAccountId },
        data: {
          status: oldAccountStatus,
          usedSlots: newUsedSlotsOld,
          notes: `Klaim garansi: sisa ${newUsedSlotsOld}/${oldMaxSlots} slot. ${claimReason || ""}`.trim(),
        },
      });
    }

    // Update slot akun baru: sold jika penuh, available jika masih ada sisa
    const newUsedSlots = (newAccount.usedSlots ?? 0) + 1;
    const newMaxSlots = newAccount.maxSlots ?? defaultMaxSlots;
    await prisma.stockAccount.update({
      where: { id: newAccount.id },
      data: {
        status: newUsedSlots >= newMaxSlots ? "sold" : "available",
        usedSlots: { increment: 1 },
      },
    });

    // 5. Update transaksi ke akun baru
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { stockAccountId: newAccount.id },
    });

    // 6. Kirim data ke webhook (fire-and-forget, tidak memblokir response)
    sendWarrantyWebhook({
      nama: transaction.user?.name ?? "-",
      email: transaction.user?.email ?? "-",
      no_hp: transaction.user?.whatsapp ?? "-",
      akun_email: newAccount.accountEmail,
      akun_password: newAccount.accountPassword,
      alasan_klaim: claimReason || "Tidak disebutkan",
      tanggal_klaim: new Date().toISOString(),
    });

    return NextResponse.json({
      claim,
      newAccount: {
        email: newAccount.accountEmail,
        password: newAccount.accountPassword,
      },
      message: "Klaim garansi berhasil! Akun baru sudah siap dikirim.",
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/warranty error:", error);
    return NextResponse.json({ error: "Gagal memproses klaim garansi" }, { status: 500 });
  }
}

// PATCH /api/warranty - Terima atau tolak klaim garansi
export async function PATCH(req: NextRequest) {
  const auth = await requirePermission("page_warranty");
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    const { claimId, action, newAccountId } = body; // action: "approve" | "reject"

    if (!claimId || !action) {
      return NextResponse.json({ error: "claimId dan action wajib diisi" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Action tidak valid. Gunakan 'approve' atau 'reject'" }, { status: 400 });
    }

    // Ambil klaim yang pending
    const claim = await prisma.warrantyClaim.findUnique({
      where: { id: claimId },
      include: {
        transaction: {
          include: {
            stockAccount: { include: { product: true } },
            user: { select: { name: true, email: true, whatsapp: true } },
          },
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Klaim tidak ditemukan" }, { status: 404 });
    }

    if (claim.status !== "pending") {
      return NextResponse.json({ error: "Klaim ini sudah diproses sebelumnya" }, { status: 400 });
    }

    // === REJECT ===
    if (action === "reject") {
      await prisma.warrantyClaim.update({
        where: { id: claimId },
        data: { status: "rejected" },
      });
      return NextResponse.json({ message: "Klaim garansi berhasil ditolak." });
    }

    // === APPROVE ===
    const transaction = claim.transaction;
    if (!transaction) {
      return NextResponse.json({ error: "Transaksi terkait tidak ditemukan" }, { status: 404 });
    }

    let newAccount;
    if (newAccountId) {
      // Manual selection
      newAccount = await prisma.stockAccount.findUnique({
        where: { id: newAccountId }
      });
      if (!newAccount) {
        return NextResponse.json({ error: "Akun pengganti tidak ditemukan" }, { status: 404 });
      }
      if (newAccount.status !== "available") {
        return NextResponse.json({ error: "Akun pengganti sudah tidak tersedia" }, { status: 400 });
      }
    } else {
      // Auto selection (fallback)
      const oldProductType = transaction.stockAccount?.product?.productType ?? "mobile";
      const oldProductId = transaction.stockAccount?.productId;
      const defaultMaxSlots = oldProductType === "desktop" ? 2 : 3;

      const candidateAccounts = await prisma.stockAccount.findMany({
        where: {
          status: "available",
          productId: oldProductId,
          usageType: "warranty",
          ...(transaction.stockAccountId ? { id: { not: transaction.stockAccountId } } : {}),
        },
        orderBy: [{ usedSlots: "asc" }, { createdAt: "asc" }],
      });

      newAccount = candidateAccounts.find(acc =>
        (acc.usedSlots ?? 0) < (acc.maxSlots ?? defaultMaxSlots)
      ) ?? null;

      if (!newAccount) {
        return NextResponse.json({ error: `Stok akun ${oldProductType} habis! Silakan tambah stok terlebih dahulu.` }, { status: 400 });
      }
    }

    // Update klaim ke resolved
    await prisma.warrantyClaim.update({
      where: { id: claimId },
      data: {
        newAccountId: newAccount.id,
        status: "resolved",
      },
    });

    // Update akun lama: kurangi slot
    if (transaction.stockAccountId) {
      const oldAccount = transaction.stockAccount;
      const currentUsedSlots = oldAccount?.usedSlots ?? 1;
      const oldMaxSlots = oldAccount?.maxSlots ?? defaultMaxSlots;
      const newUsedSlotsOld = Math.max(0, currentUsedSlots - 1);

      await prisma.stockAccount.update({
        where: { id: transaction.stockAccountId },
        data: {
          status: "available",
          usedSlots: newUsedSlotsOld,
          notes: `Klaim garansi diterima: sisa ${newUsedSlotsOld}/${oldMaxSlots} slot. ${claim.claimReason || ""}`.trim(),
        },
      });
    }

    // Update slot akun baru
    const newUsedSlots = (newAccount.usedSlots ?? 0) + 1;
    const newMaxSlots = newAccount.maxSlots ?? defaultMaxSlots;
    await prisma.stockAccount.update({
      where: { id: newAccount.id },
      data: {
        status: newUsedSlots >= newMaxSlots ? "sold" : "available",
        usedSlots: { increment: 1 },
      },
    });

    // Update transaksi ke akun baru
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { stockAccountId: newAccount.id },
    });

    // Kirim data ke webhook
    sendWarrantyWebhook({
      nama: transaction.user?.name ?? "-",
      email: transaction.user?.email ?? "-",
      no_hp: transaction.user?.whatsapp ?? "-",
      akun_email: newAccount.accountEmail,
      akun_password: newAccount.accountPassword,
      alasan_klaim: claim.claimReason || "Tidak disebutkan",
      tanggal_klaim: new Date().toISOString(),
    });

    return NextResponse.json({
      newAccount: {
        email: newAccount.accountEmail,
        password: newAccount.accountPassword,
      },
      message: "Klaim garansi diterima! Akun baru sudah siap dikirim.",
    });
  } catch (error) {
    console.error("PATCH /api/warranty error:", error);
    return NextResponse.json({ error: "Gagal memproses klaim garansi" }, { status: 500 });
  }
}
