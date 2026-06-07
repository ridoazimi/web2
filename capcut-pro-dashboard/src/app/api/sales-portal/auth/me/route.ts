import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireSales } from "@/lib/sales-auth";

export const dynamic = 'force-dynamic';

// GET /api/sales-portal/auth/me - Fetch currently logged in sales profile & performance
export async function GET(req: NextRequest) {
  const auth = await requireSales();
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const txWhere: any = {};
    if (startDate || endDate) {
      txWhere.purchaseDate = {};
      if (startDate) {
        txWhere.purchaseDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        txWhere.purchaseDate.lte = end;
      }
    }

    const sales = await prisma.salesTeam.findUnique({
      where: { id: auth.sales.id },
      include: {
        transactions: {
          where: txWhere,
          include: {
            user: { select: { name: true, email: true, whatsapp: true } },
            stockAccount: { select: { accountEmail: true } }
          },
          orderBy: { purchaseDate: "desc" }
        }
      }
    });

    if (!sales) {
      return NextResponse.json({ error: "Sales tidak ditemukan" }, { status: 404 });
    }

    const allTx = sales.transactions;
    const totalAllClosing = allTx.length;
    const successTx = allTx.filter(t => t.status === "success");
    const totalClosing = successTx.length;
    const totalRevenue = successTx.reduce((sum, tx) => sum + Number(tx.amount), 0);

    return NextResponse.json({
      sales: {
        id: sales.id,
        name: sales.name,
        code: sales.code,
        whatsapp: sales.whatsapp,
        status: sales.status,
        category: sales.category,
        createdAt: sales.createdAt,
        totalClosing,
        totalAllClosing,
        totalRevenue,
        transactions: allTx
      }
    });
  } catch (error) {
    console.error("GET /api/sales-portal/auth/me error:", error);
    return NextResponse.json({ error: "Gagal mengambil data profil sales" }, { status: 500 });
  }
}
