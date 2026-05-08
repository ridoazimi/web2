import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  const auth = await requirePermission("page_stock");
  if ("error" in auth) return auth.error;

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        maxSlots: true,
        duration: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products/list error:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar produk" }, { status: 500 });
  }
}
