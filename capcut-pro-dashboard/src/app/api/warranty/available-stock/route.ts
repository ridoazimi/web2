import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("page_warranty");
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const excludeAccountId = searchParams.get("excludeAccountId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Get product to know maxSlots
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { maxSlots: true }
    });

    const defaultMaxSlots = 3;
    const maxSlots = product?.maxSlots || defaultMaxSlots;

    const availableAccounts = await prisma.stockAccount.findMany({
      where: {
        productId,
        status: "available",
        usageType: "warranty",
        ...(excludeAccountId ? { id: { not: excludeAccountId } } : {}),
        usedSlots: { lt: maxSlots }
      },
      select: {
        id: true,
        accountEmail: true,
        usedSlots: true,
        maxSlots: true,
        createdAt: true,
      },
      orderBy: [{ usedSlots: "asc" }, { createdAt: "asc" }]
    });

    return NextResponse.json({ accounts: availableAccounts });
  } catch (error) {
    console.error("GET /api/warranty/available-stock error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
